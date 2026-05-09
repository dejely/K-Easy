export type VariableCount = 2 | 3 | 4

export type CellValue = '0' | '1' | 'X'

export type ExpressionMode = 'sop' | 'pos'

export interface ParsedTerms {
  values: number[]
  errors: string[]
}

export interface Implicant {
  pattern: string
  terms: number[]
}

export interface ImplicantGroup {
  ones: number
  implicants: Implicant[]
}

export interface CombinationStep {
  left: string
  right: string
  result: string
  terms: number[]
}

export interface TabulationRound {
  label: string
  groups: ImplicantGroup[]
  combinations: CombinationStep[]
  carriedPrimes: Implicant[]
}

export interface SimplificationResult {
  mode: ExpressionMode
  targetTerms: number[]
  dontCares: number[]
  primeImplicants: Implicant[]
  selectedImplicants: Implicant[]
  rounds: TabulationRound[]
  expression: string
  verilogExpression: string
  constant: '0' | '1' | null
}

export interface KMapCell {
  row: number
  col: number
  index: number
  bits: string
  value: CellValue
}

export interface KMapLayout {
  rowTitle: string
  colTitle: string
  rowLabels: string[]
  colLabels: string[]
  cells: KMapCell[][]
}

export interface SolveResult {
  variableCount: VariableCount
  variableNames: string[]
  minterms: number[]
  dontCares: number[]
  zeros: number[]
  truthTable: Array<{
    index: number
    bits: string
    value: CellValue
  }>
  kmap: KMapLayout
  sop: SimplificationResult
  pos: SimplificationResult
}

const DEFAULT_VARIABLE_NAMES = ['A', 'B', 'C', 'D']
const GRAY_BY_WIDTH: Record<number, string[]> = {
  1: ['0', '1'],
  2: ['00', '01', '11', '10'],
}

export const getDefaultVariableNames = (count: VariableCount) =>
  DEFAULT_VARIABLE_NAMES.slice(0, count)

export const getMaxTerm = (variableCount: VariableCount) =>
  2 ** variableCount - 1

export function parseTermList(
  input: string,
  label: string,
  maxTerm: number,
): ParsedTerms {
  const trimmed = input.trim()

  if (trimmed.length === 0) {
    return { values: [], errors: [] }
  }

  const values: number[] = []
  const errors: string[] = []
  const seen = new Set<number>()
  const tokens = trimmed.split(/[,\s]+/).filter(Boolean)

  for (const token of tokens) {
    if (!/^\d+$/.test(token)) {
      errors.push(`${label} contains "${token}", which is not a whole number.`)
      continue
    }

    const value = Number(token)

    if (value < 0 || value > maxTerm) {
      errors.push(`${label} value ${value} is outside 0-${maxTerm}.`)
      continue
    }

    if (seen.has(value)) {
      errors.push(`${label} value ${value} is repeated.`)
      continue
    }

    seen.add(value)
    values.push(value)
  }

  return {
    values: values.sort((a, b) => a - b),
    errors,
  }
}

export function validateTerms(
  minterms: number[],
  dontCares: number[],
): string[] {
  const dontCareSet = new Set(dontCares)
  const overlap = minterms.filter((term) => dontCareSet.has(term))

  if (overlap.length === 0) {
    return []
  }

  return [
    `Minterms and don't-cares overlap at ${overlap.join(', ')}. Keep each term in only one list.`,
  ]
}

export function solveBooleanFunction(
  variableCount: VariableCount,
  variableNames: string[],
  minterms: number[],
  dontCares: number[],
): SolveResult {
  const universe = getUniverse(variableCount)
  const mintermSet = new Set(minterms)
  const dontCareSet = new Set(dontCares)
  const zeros = universe.filter(
    (term) => !mintermSet.has(term) && !dontCareSet.has(term),
  )
  const truthTable = universe.map((index) => {
    const value: CellValue = mintermSet.has(index)
      ? '1'
      : dontCareSet.has(index)
        ? 'X'
        : '0'

    return {
      index,
      bits: toBits(index, variableCount),
      value,
    }
  })

  return {
    variableCount,
    variableNames,
    minterms,
    dontCares,
    zeros,
    truthTable,
    kmap: buildKMap(variableCount, minterms, dontCares),
    sop: simplifyTerms('sop', variableCount, variableNames, minterms, dontCares),
    pos: simplifyTerms('pos', variableCount, variableNames, zeros, dontCares),
  }
}

export function generateVerilogModule(
  moduleName: string,
  variableNames: string[],
  outputs: Array<{ name: string; expression: string }>,
): string {
  const ports = [...variableNames, ...outputs.map((output) => output.name)]
  const declarations = [
    `module ${moduleName}(${ports.join(', ')});`,
    `  input ${variableNames.join(', ')};`,
    `  output ${outputs.map((output) => output.name).join(', ')};`,
    '',
    ...outputs.map(
      (output) => `  assign ${output.name} = ${output.expression};`,
    ),
    'endmodule',
  ]

  return declarations.join('\n')
}

export function formatTermSet(terms: number[]) {
  return terms.length > 0 ? terms.join(', ') : 'none'
}

export function formatPatternForDisplay(
  pattern: string,
  variableNames: string[],
  mode: ExpressionMode,
) {
  if (pattern.split('').every((bit) => bit === '-')) {
    return mode === 'sop' ? '1' : '0'
  }

  const parts = pattern
    .split('')
    .map((bit, index) => {
      if (bit === '-') {
        return null
      }

      const variable = variableNames[index]

      if (mode === 'sop') {
        return bit === '1' ? variable : `${variable}'`
      }

      return bit === '0' ? variable : `${variable}'`
    })
    .filter((part): part is string => part !== null)

  return mode === 'sop' ? parts.join('') : `(${parts.join(' + ')})`
}

export function implicantCoversIndex(pattern: string, index: number) {
  const bits = toBits(index, pattern.length as VariableCount)

  return pattern
    .split('')
    .every((bit, bitIndex) => bit === '-' || bit === bits[bitIndex])
}

function simplifyTerms(
  mode: ExpressionMode,
  variableCount: VariableCount,
  variableNames: string[],
  targetTerms: number[],
  dontCares: number[],
): SimplificationResult {
  const uniqueTargets = uniqueSorted(targetTerms)
  const uniqueDontCares = uniqueSorted(dontCares)

  if (uniqueTargets.length === 0) {
    const constant = mode === 'sop' ? '0' : '1'

    return {
      mode,
      targetTerms: uniqueTargets,
      dontCares: uniqueDontCares,
      primeImplicants: [],
      selectedImplicants: [],
      rounds: [],
      expression: constant,
      verilogExpression: `1'b${constant}`,
      constant,
    }
  }

  const { primeImplicants, rounds } = collectPrimeImplicants(
    variableCount,
    uniqueTargets,
    uniqueDontCares,
  )
  const selectedImplicants = selectPrimeImplicants(
    primeImplicants,
    uniqueTargets,
  )
  const expression = formatExpression(
    selectedImplicants,
    variableNames,
    mode,
  )
  const verilogExpression = formatVerilogExpression(
    selectedImplicants,
    variableNames,
    mode,
  )

  return {
    mode,
    targetTerms: uniqueTargets,
    dontCares: uniqueDontCares,
    primeImplicants,
    selectedImplicants,
    rounds,
    expression,
    verilogExpression,
    constant: expression === '0' || expression === '1' ? expression : null,
  }
}

function collectPrimeImplicants(
  variableCount: VariableCount,
  targetTerms: number[],
  dontCares: number[],
) {
  const allTerms = uniqueSorted([...targetTerms, ...dontCares])
  let current = allTerms.map((term) => ({
    pattern: toBits(term, variableCount),
    terms: [term],
  }))
  const rounds: TabulationRound[] = []
  const primeMap = new Map<string, Implicant>()
  let roundIndex = 0

  while (current.length > 0) {
    const groups = groupImplicants(current)
    const usedPatterns = new Set<string>()
    const nextMap = new Map<string, Implicant>()
    const combinations: CombinationStep[] = []

    for (let index = 0; index < groups.length - 1; index += 1) {
      const leftGroup = groups[index]
      const rightGroup = groups[index + 1]

      if (rightGroup.ones !== leftGroup.ones + 1) {
        continue
      }

      for (const left of leftGroup.implicants) {
        for (const right of rightGroup.implicants) {
          const combinedPattern = combinePatterns(left.pattern, right.pattern)

          if (combinedPattern === null) {
            continue
          }

          usedPatterns.add(left.pattern)
          usedPatterns.add(right.pattern)

          const terms = uniqueSorted([...left.terms, ...right.terms])
          const existing = nextMap.get(combinedPattern)
          nextMap.set(combinedPattern, {
            pattern: combinedPattern,
            terms: existing ? uniqueSorted([...existing.terms, ...terms]) : terms,
          })
          combinations.push({
            left: left.pattern,
            right: right.pattern,
            result: combinedPattern,
            terms,
          })
        }
      }
    }

    const carriedPrimes = current.filter(
      (implicant) => !usedPatterns.has(implicant.pattern),
    )

    for (const implicant of carriedPrimes) {
      if (coversAnyTarget(implicant.pattern, targetTerms)) {
        primeMap.set(implicant.pattern, implicant)
      }
    }

    rounds.push({
      label: roundIndex === 0 ? 'Initial groups' : `Round ${roundIndex}`,
      groups,
      combinations: dedupeCombinations(combinations),
      carriedPrimes,
    })

    if (nextMap.size === 0) {
      break
    }

    current = sortImplicants([...nextMap.values()])
    roundIndex += 1
  }

  return {
    primeImplicants: sortImplicants([...primeMap.values()]),
    rounds,
  }
}

function selectPrimeImplicants(
  primeImplicants: Implicant[],
  targetTerms: number[],
) {
  const selected = new Map<string, Implicant>()
  const covered = new Set<number>()

  for (const term of targetTerms) {
    const covering = primeImplicants.filter((implicant) =>
      implicantCoversIndex(implicant.pattern, term),
    )

    if (covering.length === 1) {
      selected.set(covering[0].pattern, covering[0])
    }
  }

  for (const implicant of selected.values()) {
    for (const term of targetTerms) {
      if (implicantCoversIndex(implicant.pattern, term)) {
        covered.add(term)
      }
    }
  }

  while (covered.size < targetTerms.length) {
    const candidates = primeImplicants
      .filter((implicant) => !selected.has(implicant.pattern))
      .map((implicant) => ({
        implicant,
        newlyCovered: targetTerms.filter(
          (term) =>
            !covered.has(term) && implicantCoversIndex(implicant.pattern, term),
        ),
      }))
      .filter((candidate) => candidate.newlyCovered.length > 0)
      .sort((a, b) => {
        if (b.newlyCovered.length !== a.newlyCovered.length) {
          return b.newlyCovered.length - a.newlyCovered.length
        }

        const literalDelta =
          literalCount(a.implicant.pattern) - literalCount(b.implicant.pattern)

        if (literalDelta !== 0) {
          return literalDelta
        }

        return a.implicant.pattern.localeCompare(b.implicant.pattern)
      })

    const best = candidates[0]

    if (!best) {
      break
    }

    selected.set(best.implicant.pattern, best.implicant)

    for (const term of best.newlyCovered) {
      covered.add(term)
    }
  }

  return sortImplicants([...selected.values()])
}

function buildKMap(
  variableCount: VariableCount,
  minterms: number[],
  dontCares: number[],
): KMapLayout {
  const rowBitCount = variableCount === 4 ? 2 : 1
  const colBitCount = variableCount - rowBitCount
  const rowLabels = GRAY_BY_WIDTH[rowBitCount]
  const colLabels = GRAY_BY_WIDTH[colBitCount]
  const mintermSet = new Set(minterms)
  const dontCareSet = new Set(dontCares)
  const cells = rowLabels.map((rowLabel, row) =>
    colLabels.map((colLabel, col) => {
      const bits = `${rowLabel}${colLabel}`
      const index = Number.parseInt(bits, 2)

      const value: CellValue = mintermSet.has(index)
        ? '1'
        : dontCareSet.has(index)
          ? 'X'
          : '0'

      return {
        row,
        col,
        index,
        bits,
        value,
      }
    }),
  )

  return {
    rowTitle: variableCount === 4 ? 'AB' : 'A',
    colTitle: variableCount === 2 ? 'B' : variableCount === 3 ? 'BC' : 'CD',
    rowLabels,
    colLabels,
    cells,
  }
}

function formatExpression(
  implicants: Implicant[],
  variableNames: string[],
  mode: ExpressionMode,
) {
  if (implicants.length === 0) {
    return mode === 'sop' ? '0' : '1'
  }

  if (implicants.some((implicant) => isAllDontCare(implicant.pattern))) {
    return mode === 'sop' ? '1' : '0'
  }

  const terms = implicants.map((implicant) =>
    formatPatternForDisplay(implicant.pattern, variableNames, mode),
  )

  return mode === 'sop' ? terms.join(' + ') : terms.join('')
}

function formatVerilogExpression(
  implicants: Implicant[],
  variableNames: string[],
  mode: ExpressionMode,
) {
  if (implicants.length === 0) {
    return mode === 'sop' ? "1'b0" : "1'b1"
  }

  if (implicants.some((implicant) => isAllDontCare(implicant.pattern))) {
    return mode === 'sop' ? "1'b1" : "1'b0"
  }

  const terms = implicants.map((implicant) =>
    formatVerilogPattern(implicant.pattern, variableNames, mode),
  )

  return mode === 'sop' ? terms.join(' | ') : terms.join(' & ')
}

function formatVerilogPattern(
  pattern: string,
  variableNames: string[],
  mode: ExpressionMode,
) {
  const literals = pattern
    .split('')
    .map((bit, index) => {
      if (bit === '-') {
        return null
      }

      const variable = variableNames[index]

      if (mode === 'sop') {
        return bit === '1' ? variable : `~${variable}`
      }

      return bit === '0' ? variable : `~${variable}`
    })
    .filter((part): part is string => part !== null)

  if (literals.length === 1) {
    return literals[0]
  }

  return `(${literals.join(mode === 'sop' ? ' & ' : ' | ')})`
}

function groupImplicants(implicants: Implicant[]) {
  const groupMap = new Map<number, Implicant[]>()

  for (const implicant of implicants) {
    const ones = countOnes(implicant.pattern)
    const existing = groupMap.get(ones) ?? []
    existing.push(implicant)
    groupMap.set(ones, existing)
  }

  return [...groupMap.entries()]
    .sort(([left], [right]) => left - right)
    .map(([ones, groupImplicants]) => ({
      ones,
      implicants: sortImplicants(groupImplicants),
    }))
}

function combinePatterns(left: string, right: string) {
  let differences = 0
  let combined = ''

  for (let index = 0; index < left.length; index += 1) {
    const leftBit = left[index]
    const rightBit = right[index]

    if (leftBit === rightBit) {
      combined += leftBit
      continue
    }

    if (leftBit === '-' || rightBit === '-') {
      return null
    }

    differences += 1
    combined += '-'
  }

  return differences === 1 ? combined : null
}

function coversAnyTarget(pattern: string, targetTerms: number[]) {
  return targetTerms.some((term) => implicantCoversIndex(pattern, term))
}

function dedupeCombinations(combinations: CombinationStep[]) {
  const byKey = new Map<string, CombinationStep>()

  for (const combination of combinations) {
    const key = `${combination.left}:${combination.right}:${combination.result}`
    byKey.set(key, combination)
  }

  return [...byKey.values()].sort((a, b) =>
    `${a.result}:${a.left}:${a.right}`.localeCompare(
      `${b.result}:${b.left}:${b.right}`,
    ),
  )
}

function sortImplicants(implicants: Implicant[]) {
  return [...implicants].sort((a, b) => {
    const firstTermDelta = (a.terms[0] ?? 0) - (b.terms[0] ?? 0)

    if (firstTermDelta !== 0) {
      return firstTermDelta
    }

    return a.pattern.localeCompare(b.pattern)
  })
}

function getUniverse(variableCount: VariableCount) {
  return Array.from({ length: 2 ** variableCount }, (_, index) => index)
}

function uniqueSorted(values: number[]) {
  return [...new Set(values)].sort((a, b) => a - b)
}

function toBits(value: number, width: number) {
  return value.toString(2).padStart(width, '0')
}

function countOnes(pattern: string) {
  return pattern.split('').filter((bit) => bit === '1').length
}

function literalCount(pattern: string) {
  return pattern.split('').filter((bit) => bit !== '-').length
}

function isAllDontCare(pattern: string) {
  return pattern.split('').every((bit) => bit === '-')
}
