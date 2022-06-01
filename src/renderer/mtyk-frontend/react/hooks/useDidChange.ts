import React, { useRef } from 'react'

export default function useDidChange<T = any>(val: T): boolean {
  const prevVal = useRef(undefined)
  const changed = prevVal.current !== val
  prevVal.current = val
  return changed
}
