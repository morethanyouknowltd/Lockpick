import { useRef } from 'react'

export default function useAsyncFunctionQueuer() {
  const isAsyncing = useRef(false)
  return {
    /**
     * Ensure fn cannot be called while a copy of any async fns creating by
     * this queuer are still executing
     */
    makeQuenedAsyncFn: <A, R>(fn: (...args: A[]) => R) => {
      return async (...args: A[]) => {
        if (!isAsyncing.current) {
          isAsyncing.current = true
          try {
            const result = await fn(...args)
            return result
          } catch (e) {
            console.error(e)
          } finally {
            isAsyncing.current = false
          }
        }
      }
    },
  }
}
