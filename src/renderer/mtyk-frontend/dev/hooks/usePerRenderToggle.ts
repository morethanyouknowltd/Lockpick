import { useEffect, useState } from 'react'

export default function usePerRenderToggle(
  fn: () => void,
  { timeout, deps }: { timeout?: number; deps?: any[] }
) {
  const [skippingForDev, setSkippingForDev] = useState(false)
  useEffect(() => {
    if (skippingForDev) {
      setTimeout(fn, timeout ?? 100)
    }
  }, (deps ?? []).concat(skippingForDev))
  return {
    start: () => setSkippingForDev(true),
  }
}
