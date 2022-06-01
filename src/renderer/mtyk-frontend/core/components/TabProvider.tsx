import type { MTYKTab} from '../../core/contexts/TabbedContext';
import { TabbedContext } from '../../core/contexts/TabbedContext'
import React, { useState, useContext, useEffect } from 'react'

export default function TabProvider({
  tabs: _tabs,
  children,
}: {
  tabs: MTYKTab[] | string[]
  children?: any
}) {
  const tabs = _tabs.map(t => (typeof t === 'string' ? { label: t } : t))
  const [activeTab, setActiveTab] = useState(tabs[0])
  useEffect(() => {
    // If no active tab, or it doensn't exist, set to first tab
    if (!activeTab || !tabs.find(t => t.label === activeTab.label)) {
      setActiveTab(tabs[0])
    }
  })

  return (
    <TabbedContext.Provider
      value={{
        tabs: tabs.map(t => {
          return {
            ...t,
            isActive: activeTab?.label === t.label,
          }
        }),
        setTab: tab => setActiveTab(tab),
        activeTab: tabs.find(t => t.label === activeTab?.label),
      }}>
      {children}
    </TabbedContext.Provider>
  )
}

export const TabSpy = ({ children }: { children: any }) => {
  const context = useContext(TabbedContext)
  return children(context)
}
