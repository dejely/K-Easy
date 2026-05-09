type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="grid min-h-44 place-items-center rounded-lg border border-dashed bg-muted/35 p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}
