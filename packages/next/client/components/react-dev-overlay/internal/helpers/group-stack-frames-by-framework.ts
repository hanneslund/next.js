import type { OriginalStackFrame } from './stack-frame'

export type StackFramesGroup = {
  framework?: 'next' | 'react'
  stackFrames: OriginalStackFrame[]
}

/**
 * Get the origin framework of the stack frame by package name.
 */
function getFramework(
  sourcePackage: string | null
): StackFramesGroup['framework'] {
  if (!sourcePackage) return undefined

  if (
    /^(react|react-dom|react-is|react-refresh|react-server-dom-webpack|scheduler)$/.test(
      sourcePackage
    )
  ) {
    return 'react'
  } else if (sourcePackage === 'next') {
    return 'next'
  }

  return undefined
}

/**
 * Group sequences of stack frames by framework.
 *
 * Given the following stack frames:
 * Error
 *   user code
 *   user code
 *   react
 *   react
 *   next
 *   next
 *   react
 *   react
 *
 * The grouped stack frames would be:
 * > user code
 * > react
 * > next
 * > react
 *
 */
export function groupStackFramesByFramework(
  stackFrames: OriginalStackFrame[]
): StackFramesGroup[] {
  const stackFramesGroupedByFramework: StackFramesGroup[] = []

  for (const stackFrame of stackFrames) {
    const last =
      stackFramesGroupedByFramework[stackFramesGroupedByFramework.length - 1]
    const framework = getFramework(stackFrame.sourcePackage)

    if (last) {
      if (last.framework === framework) {
        last.stackFrames.push(stackFrame)
      } else {
        stackFramesGroupedByFramework.push({
          framework: framework,
          stackFrames: [stackFrame],
        })
      }
    } else {
      stackFramesGroupedByFramework.push({
        framework: framework,
        stackFrames: [stackFrame],
      })
    }
  }

  return stackFramesGroupedByFramework
}
