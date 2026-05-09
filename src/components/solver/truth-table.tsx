import { Table2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SolveResult } from '@/solver'
import { SectionTitle } from './section-title'

type TruthTableProps = {
  solution: SolveResult
}

export function TruthTable({ solution }: TruthTableProps) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Table2} eyebrow="Steps" title="Truth Table" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>m</TableHead>
              {solution.variableNames.map((name) => (
                <TableHead key={name} className="text-center">
                  {name}
                </TableHead>
              ))}
              <TableHead className="text-center">Y</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solution.truthTable.map((row) => (
              <TableRow key={row.index}>
                <TableCell className="font-mono text-muted-foreground">
                  m{row.index}
                </TableCell>
                {row.bits.split('').map((bit, index) => (
                  <TableCell
                    key={`${row.index}-${solution.variableNames[index]}`}
                    className="text-center"
                  >
                    {bit}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  <Badge
                    variant={row.value === '0' ? 'outline' : 'secondary'}
                    className={cn(
                      row.value === '1' &&
                        'border-emerald-200 bg-emerald-50 text-emerald-700',
                      row.value === 'X' &&
                        'border-amber-200 bg-amber-50 text-amber-700',
                    )}
                  >
                    {row.value}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
