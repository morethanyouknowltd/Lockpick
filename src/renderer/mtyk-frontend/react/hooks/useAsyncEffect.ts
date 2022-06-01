import { useEffect } from 'react'
import useIsMounted from './useIsMounted'

export default function useAsyncEffect(
  fn: (isMounted: () => boolean) => Promise<any>,
  deps: any[]
) {
  const isMounted = useIsMounted()
  return useEffect(() => {
    fn(isMounted)
  }, deps)
}
