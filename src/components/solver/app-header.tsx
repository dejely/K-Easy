import { CircuitBoard } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

export function AppHeader() {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
          <CircuitBoard className="size-4" />
          Boolean minimization workspace
        </div>
        <h1 className="text-3xl font-semibold tracking-normal text-foreground">
          K-Map and Tabulation Solver
        </h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">2-4 variables</Badge>
        <Badge variant="secondary">SOP/POS</Badge>
        <Badge variant="secondary">Verilog</Badge>
      </div>
    </header>
  )
}
