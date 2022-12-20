export type ComponentStackFrame = {
  component: string
  file?: string
  lineNumber?: number
  column?: number
}

export function parseComponentStack(
  componentStack: string
): ComponentStackFrame[] {
  const componentStackFrames: ComponentStackFrame[] = []

  for (const line of componentStack.trim().split('\n')) {
    // Get component and file from the component stack line
    const match = /at ([^ ]+)( \((.*)\))?/.exec(line)
    if (match && match[1]) {
      const component = match[1]
      const webpackFile = match[3]

      const modulePath = webpackFile?.replace(
        /^(webpack-internal:\/\/\/|file:\/\/)(\(.*\)\/)?/,
        ''
      )
      const [file, lineNumber, column] = modulePath?.split(':') ?? []

      componentStackFrames.push({
        component,
        file,
        lineNumber: lineNumber ? Number(lineNumber) : undefined,
        column: column ? Number(column) : undefined,
      })
    }
  }

  return componentStackFrames
}
