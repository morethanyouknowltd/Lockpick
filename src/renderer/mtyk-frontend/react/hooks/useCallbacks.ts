import { useCallback } from 'react'

export default function useCallbacks<
  T extends {
    [key: string]: (...args: any[]) => any
  }
>(callbackObj: T, deps: any[] = []): T {
  // const prevKeys = useRef<string[]>(Object.keys(callbackObj))
  let out: T = {} as any
  for (const key in callbackObj) {
    out[key] = useCallback(callbackObj[key], deps)
  }
  return out
}
