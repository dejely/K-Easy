import { Sigma } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  formatPatternForDisplay,
  type ExpressionMode,
  type Implicant,
} from '@/solver'
import { SectionTitle } from './section-title'

type ExpressionCardProps = {
  title: string
  expression: string
  verilogExpression: string
  implicants: Implicant[]
  variableNames: string[]
  mode: ExpressionMode
}

export function ExpressionCard({
  title,
  expression,
  verilogExpression,
  implicants,
  variableNames,
  mode,
}: ExpressionCardProps) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle icon={Sigma} eyebrow={title} title={expression} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {implicants.length > 0 ? (
            implicants.map((implicant, index) => (
              <Badge key={implicant.pattern} variant="secondary">
                G{index + 1}:{' '}
                {formatPatternForDisplay(implicant.pattern, variableNames, mode)}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary">Constant output</Badge>
          )}
        </div>
        <code className="block overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-sm text-foreground">
          {verilogExpression}
        </code>
      </CardContent>
    </Card>
  )
}
