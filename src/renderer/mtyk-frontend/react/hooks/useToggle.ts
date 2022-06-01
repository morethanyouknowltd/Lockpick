import { useState } from 'react'

export default function useToggle(defaultVal: boolean) {
  const [state, setState] = useState<boolean>(defaultVal)
  return [state, () => setState(!state)] as const
}
