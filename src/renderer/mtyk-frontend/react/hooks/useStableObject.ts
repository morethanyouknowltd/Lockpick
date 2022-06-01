import { useRef, useState } from 'react'

export default function useStableObject<T>(defaultValue?: T) {
  const obj = useRef(defaultValue)
  const [z, setState] = useState({}) // we just use this to refresh react
  return [
    obj.current as T,
    (fn) => {
      const newVal =
        typeof fn === 'function'
          ? (fn as any)(obj.current)
          : Object.assign(obj.current, fn)
      obj.current = newVal
      setState({})
    },
  ] as [T, (fn: ((obj: T) => T) | T) => void]
}
