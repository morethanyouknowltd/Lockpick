import { useRef } from 'react'

export default function useClassicReducer<T>(
  fn: (prev?: T) => T,
  dependencies: any[]
) {
  const oldDeps = useRef(dependencies)
  const prev = useRef(fn())
  for (let i = 0; i < oldDeps.current.length; i++) {
    if (oldDeps.current[i] !== dependencies[i]) {
      oldDeps.current = dependencies
      prev.current = fn(prev.current)
      break
    }
  }
  return prev.current
}
