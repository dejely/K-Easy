import type { SolveResult } from '@/solver'
import { ExpressionCard } from './expression-card'
import { GeneratedVerilogCard } from './generated-verilog-card'
import { TabulationView } from './tabulation-view'
import { TruthTable } from './truth-table'

type SolutionSectionsProps = {
  solution: SolveResult
  variableNames: string[]
  customVerilog: string
}

export function SolutionSections({
  solution,
  variableNames,
  customVerilog,
}: SolutionSectionsProps) {
  return (
    <>
      <section
        className="grid gap-5 lg:grid-cols-2"
        aria-label="Simplified results"
      >
        <ExpressionCard
          title="SOP"
          expression={solution.sop.expression}
          verilogExpression={solution.sop.verilogExpression}
          implicants={solution.sop.selectedImplicants}
          variableNames={variableNames}
          mode="sop"
        />
        <ExpressionCard
          title="POS"
          expression={solution.pos.expression}
          verilogExpression={solution.pos.verilogExpression}
          implicants={solution.pos.selectedImplicants}
          variableNames={variableNames}
          mode="pos"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <TruthTable solution={solution} />
        <TabulationView
          title="SOP Tabulation"
          rounds={solution.sop.rounds}
          primeImplicants={solution.sop.primeImplicants}
          selectedImplicants={solution.sop.selectedImplicants}
          variableNames={variableNames}
          mode="sop"
        />
        <TabulationView
          title="POS Tabulation"
          rounds={solution.pos.rounds}
          primeImplicants={solution.pos.primeImplicants}
          selectedImplicants={solution.pos.selectedImplicants}
          variableNames={variableNames}
          mode="pos"
        />
      </section>

      <GeneratedVerilogCard code={customVerilog} />
    </>
  )
}
