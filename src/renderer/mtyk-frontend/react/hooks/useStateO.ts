import { useState } from 'react'

export default function useStateO<T>(defaultValue?: T) {
  const [value, set] = useState(defaultValue)
  return { value, set }
}
