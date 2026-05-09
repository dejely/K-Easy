import { Code2 } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { CIRCUIT_EXAMPLES } from '@/data/circuit-examples'
import { generateVerilogModule, solveBooleanFunction } from '@/solver'
import { CodeBlock } from './code-block'
import { SectionTitle } from './section-title'

export function ExampleModules() {
  return (
    <Card>
      <CardHeader>
        <SectionTitle
          icon={Code2}
          eyebrow="Circuit library"
          title="Built-in Verilog Modules"
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-2">
          {CIRCUIT_EXAMPLES.map((example) => {
            const outputs = example.outputs.map((output) => {
              const result = solveBooleanFunction(
                example.variableCount,
                example.variableNames,
                output.minterms,
                [],
              )

              return {
                name: output.name,
                expression: result.sop.verilogExpression,
              }
            })

            return (
              <div key={example.id} className="grid gap-3 rounded-lg border p-4">
                <div>
                  <h3 className="font-medium text-foreground">
                    {example.title}
                  </h3>
                  <CardDescription>{example.moduleName}</CardDescription>
                </div>
                <CodeBlock
                  code={generateVerilogModule(
                    example.moduleName,
                    example.variableNames,
                    outputs,
                  )}
                />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
