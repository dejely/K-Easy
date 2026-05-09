import { GitBranch } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  formatPatternForDisplay,
  formatTermSet,
  type ExpressionMode,
  type Implicant,
  type TabulationRound,
} from '@/solver'
import { EmptyState } from './empty-state'
import { SectionTitle } from './section-title'

type TabulationViewProps = {
  title: string
  rounds: TabulationRound[]
  primeImplicants: Implicant[]
  selectedImplicants: Implicant[]
  variableNames: string[]
  mode: ExpressionMode
}

export function TabulationView({
  title,
  rounds,
  primeImplicants,
  selectedImplicants,
  variableNames,
  mode,
}: TabulationViewProps) {
  const headingId = `${mode}-tabulation-heading`

  return (
    <Card aria-labelledby={headingId}>
      <CardHeader>
        <SectionTitle icon={GitBranch} eyebrow="Quine-McCluskey" title={title} />
      </CardHeader>
      <CardContent className="space-y-4">
        {rounds.length > 0 ? (
          <div className="grid gap-2">
            {rounds.map((round) => (
              <details
                key={round.label}
                open={round.label === 'Initial groups'}
                className="rounded-lg border bg-muted/35"
              >
                <summary className="cursor-pointer px-3 py-2 font-medium text-foreground">
                  {round.label}
                </summary>
                <div className="grid gap-3 border-t p-3">
                  {round.groups.map((group) => (
                    <RoundGroup key={group.ones} label={`${group.ones} ones`}>
                      {group.implicants.map((implicant) => (
                        <Badge key={implicant.pattern} variant="outline">
                          {implicant.pattern} [{formatTermSet(implicant.terms)}]
                        </Badge>
                      ))}
                    </RoundGroup>
                  ))}
                  {round.combinations.length > 0 ? (
                    <RoundGroup label="Combined">
                      {round.combinations.map((step) => (
                        <Badge
                          key={`${step.left}-${step.right}-${step.result}`}
                          variant="secondary"
                        >
                          {step.left} + {step.right} = {step.result}
                        </Badge>
                      ))}
                    </RoundGroup>
                  ) : null}
                  {round.carriedPrimes.length > 0 ? (
                    <RoundGroup label="Prime candidates">
                      {round.carriedPrimes.map((implicant) => (
                        <Badge key={implicant.pattern} variant="secondary">
                          {implicant.pattern}
                        </Badge>
                      ))}
                    </RoundGroup>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <EmptyState message="Constant output; no tabulation rounds required." />
        )}

        <div className="grid gap-3 border-t pt-4">
          <ImplicantSummary
            title="Prime implicants"
            value={formatImplicants(primeImplicants, variableNames, mode, 'none')}
          />
          <ImplicantSummary
            title="Selected"
            value={formatImplicants(
              selectedImplicants,
              variableNames,
              mode,
              'constant',
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function RoundGroup({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-2">
      <strong className="text-sm text-foreground">{label}</strong>
      <div className="flex flex-wrap gap-2 font-mono text-xs">{children}</div>
    </div>
  )
}

function ImplicantSummary({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <strong className="text-sm text-foreground">{title}</strong>
      <p className="mt-1 break-words font-mono text-sm text-muted-foreground">
        {value}
      </p>
    </div>
  )
}

function formatImplicants(
  implicants: Implicant[],
  variableNames: string[],
  mode: ExpressionMode,
  fallback: string,
) {
  if (implicants.length === 0) {
    return fallback
  }

  return implicants
    .map((implicant) =>
      formatPatternForDisplay(implicant.pattern, variableNames, mode),
    )
    .join(', ')
}
