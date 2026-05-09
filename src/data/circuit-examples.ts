import type { VariableCount } from '@/solver'

export type ExampleOutput = {
  name: string
  minterms: number[]
}

export type CircuitExample = {
  id: string
  title: string
  description: string
  moduleName: string
  variableCount: VariableCount
  variableNames: string[]
  outputs: ExampleOutput[]
}

export const CIRCUIT_EXAMPLES: CircuitExample[] = [
  {
    id: 'mux',
    title: '2:1 Multiplexer',
    description: 'Selects D0 when S is 0, and D1 when S is 1.',
    moduleName: 'mux_2_to_1',
    variableCount: 3,
    variableNames: ['S', 'D0', 'D1'],
    outputs: [
      {
        name: 'Y',
        minterms: [2, 3, 5, 7],
      },
    ],
  },
  {
    id: 'full-adder',
    title: '1-bit Full Adder',
    description: 'Produces sum and carry from A, B, and Cin.',
    moduleName: 'full_adder_1bit',
    variableCount: 3,
    variableNames: ['A', 'B', 'Cin'],
    outputs: [
      {
        name: 'sum',
        minterms: [1, 2, 4, 7],
      },
      {
        name: 'carry',
        minterms: [3, 5, 6, 7],
      },
    ],
  },
]
