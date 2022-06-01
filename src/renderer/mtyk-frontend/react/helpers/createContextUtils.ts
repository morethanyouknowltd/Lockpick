import { createContext, useContext } from 'react'

export default function createContextUtils<C>(initialValue: C = undefined as any) {
  const context = createContext(initialValue)
  return {
    context,
    useContext: () => useContext(context),
    provider: context.Provider,
  }
}
