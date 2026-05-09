import type { ComponentType } from 'react'

import { CardTitle } from '@/components/ui/card'

type SectionTitleProps = {
  icon: ComponentType<{ className?: string }>
  eyebrow: string
  title: string
}

export function SectionTitle({ icon: Icon, eyebrow, title }: SectionTitleProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
        <Icon className="size-4" />
        {eyebrow}
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
    </div>
  )
}
