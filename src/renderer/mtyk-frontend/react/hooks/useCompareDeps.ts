import { useEffect, useRef } from 'react'
import { useState } from 'react'

export default function useCompareDeps<T, R>(
  fn: (prev: T[]) => R,
  dependencies: T[]
) {
  const [prevDeps, setPrevDeps] = useState(dependencies)
  useEffect(() => {
    setPrevDeps(dependencies)
  }, dependencies)
  return fn(prevDeps) as R
}
