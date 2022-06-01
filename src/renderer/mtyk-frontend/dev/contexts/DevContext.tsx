import { createContext } from 'react'

export interface DevAction {
  name: string
  fn: () => void
  componentId: number
}

export type DevContextType = {
  actions: DevAction[]
  removeActions: (componentId: number) => void
  provideActions: (action: DevAction[]) => void
}

const DevContext = createContext<DevContextType>({} as any)
export default DevContext
