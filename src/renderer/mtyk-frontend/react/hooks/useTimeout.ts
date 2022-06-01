import { useEffect } from 'react'

export default function useTimeout(callback: Function, ms: number) {
  useEffect(() => {
    const timeoutId = setTimeout(callback, ms)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [ms, callback])
}
