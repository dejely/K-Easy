import { useMemo, useState } from 'react'

import { AppHeader } from '@/components/solver/app-header'
import { ExampleModules } from '@/components/solver/example-modules'
import { InputPanel } from '@/components/solver/input-panel'
import { KMapPanel } from '@/components/solver/kmap-panel'
import { SolutionSections } from '@/components/solver/solution-sections'
import type { CircuitExample, ExampleOutput } from '@/data/circuit-examples'
import {
  generateVerilogModule,
  getDefaultVariableNames,
  getMaxTerm,
  parseTermList,
  solveBooleanFunction,
  validateTerms,
  type VariableCount,
} from '@/solver'

function App() {
  const [variableCount, setVariableCount] = useState<VariableCount>(2)
  const [variableNames, setVariableNames] = useState<string[]>(
    getDefaultVariableNames(2),
  )
  const [mintermInput, setMintermInput] = useState('1, 3')
  const [dontCareInput, setDontCareInput] = useState('')
  const [activeExample, setActiveExample] = useState('custom')

  const maxTerm = getMaxTerm(variableCount)
  const parsedMinterms = useMemo(
    () => parseTermList(mintermInput, 'Minterms', maxTerm),
    [maxTerm, mintermInput],
  )
  const parsedDontCares = useMemo(
    () => parseTermList(dontCareInput, "Don't-cares", maxTerm),
    [dontCareInput, maxTerm],
  )
  const validationErrors = useMemo(
    () => validateTerms(parsedMinterms.values, parsedDontCares.values),
    [parsedDontCares.values, parsedMinterms.values],
  )
  const errors = useMemo(
    () => [
      ...parsedMinterms.errors,
      ...parsedDontCares.errors,
      ...validationErrors,
    ],
    [parsedDontCares.errors, parsedMinterms.errors, validationErrors],
  )
  const hasErrors = errors.length > 0

  const solution = useMemo(() => {
    if (hasErrors) {
      return null
    }

    return solveBooleanFunction(
      variableCount,
      variableNames,
      parsedMinterms.values,
      parsedDontCares.values,
    )
  }, [
    hasErrors,
    parsedDontCares.values,
    parsedMinterms.values,
    variableCount,
    variableNames,
  ])
  const customVerilog = useMemo(() => {
    if (!solution) {
      return ''
    }

    return generateVerilogModule('boolean_solver', variableNames, [
      { name: 'Y', expression: solution.sop.verilogExpression },
    ])
  }, [solution, variableNames])

  const resetSolver = () => {
    setVariableCount(2)
    setVariableNames(getDefaultVariableNames(2))
    setMintermInput('1, 3')
    setDontCareInput('')
    setActiveExample('custom')
  }

  const handleVariableCountChange = (nextValue: string) => {
    const nextCount = Number(nextValue) as VariableCount
    setVariableCount(nextCount)
    setVariableNames(getDefaultVariableNames(nextCount))
    setMintermInput('')
    setDontCareInput('')
    setActiveExample('custom')
  }

  const handleMintermInputChange = (nextValue: string) => {
    setMintermInput(nextValue)
    setActiveExample('custom')
  }

  const handleDontCareInputChange = (nextValue: string) => {
    setDontCareInput(nextValue)
    setActiveExample('custom')
  }

  const loadOutput = (example: CircuitExample, output: ExampleOutput) => {
    setVariableCount(example.variableCount)
    setVariableNames(example.variableNames)
    setMintermInput(output.minterms.join(', '))
    setDontCareInput('')
    setActiveExample(`${example.id}:${output.name}`)
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <AppHeader />

      <section className="grid gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
        <InputPanel
          variableCount={variableCount}
          variableNames={variableNames}
          mintermInput={mintermInput}
          dontCareInput={dontCareInput}
          maxTerm={maxTerm}
          parsedMinterms={parsedMinterms}
          parsedDontCares={parsedDontCares}
          errors={errors}
          activeExample={activeExample}
          onVariableCountChange={handleVariableCountChange}
          onMintermInputChange={handleMintermInputChange}
          onDontCareInputChange={handleDontCareInputChange}
          onReset={resetSolver}
          onLoadOutput={loadOutput}
        />
        <KMapPanel maxTerm={maxTerm} solution={solution} />
      </section>

      {solution ? (
        <SolutionSections
          solution={solution}
          variableNames={variableNames}
          customVerilog={customVerilog}
        />
      ) : null}

      <ExampleModules />
    </main>
  )
}

export default App
