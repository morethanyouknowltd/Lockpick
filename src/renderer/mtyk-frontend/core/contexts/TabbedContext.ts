import React from 'react'

export type MTYKTab = {
  label: string
  isActive?: boolean
}

export const TabbedContext = React.createContext<{
  tabs: MTYKTab[]
  setTab: (tab: MTYKTab) => void
  activeTab?: MTYKTab
    }>({
      tabs: [] as MTYKTab[],
      setTab: () => {},
    })
