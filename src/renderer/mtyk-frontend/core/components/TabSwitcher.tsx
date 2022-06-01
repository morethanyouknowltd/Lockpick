import React, { useContext } from 'react'
import Flex from '../../core/components/Flex'
import type { MTYKTab } from '../../core/contexts/TabbedContext'
import { TabbedContext } from '../../core/contexts/TabbedContext'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'

export interface TabSwitcherProps extends DefaultNativeProps {
  tabs?: MTYKTab[]
  renderButton: (props: any, tab: MTYKTab) => React.ReactElement
}

function TabSwitcher(props: TabSwitcherProps) {
  const tabContext = useContext(TabbedContext)
  const tabs = props.tabs ?? tabContext.tabs ?? []
  if (!tabs.length) {
    return null
  }
  return (
    <Flex row gap={8} style={{ ...props.style }}>
      {tabs.map((t, index) =>
        props.renderButton(
          {
            index,
            onPress: () => tabContext.setTab(t),
            onClick: () => tabContext.setTab(t),
            key: t.label,
            ...t,
          },
          t
        )
      )}
    </Flex>
  )
}

export default TabSwitcher
