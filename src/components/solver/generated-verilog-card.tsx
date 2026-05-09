import { Code2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CodeBlock } from './code-block'
import { SectionTitle } from './section-title'

type GeneratedVerilogCardProps = {
  code: string
}

export function GeneratedVerilogCard({ code }: GeneratedVerilogCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <SectionTitle
          icon={Code2}
          eyebrow="Generated code"
          title="Verilog Implementation"
        />
        <Badge variant="outline">SOP assign</Badge>
      </CardHeader>
      <CardContent>
        <CodeBlock code={code} />
      </CardContent>
    </Card>
  )
}
