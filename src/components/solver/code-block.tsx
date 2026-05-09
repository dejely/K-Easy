type CodeBlockProps = {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100">
      {code}
    </pre>
  )
}
