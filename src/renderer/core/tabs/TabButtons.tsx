import TabController from '@mtyk/frontend/controllers/controllers/TabController'
import { Flex, Icon } from '@mtyk/frontend/core/components'
import { MTYKIcon } from '@mtyk/frontend/core/components/Icon'
import React from 'react'

export interface TabButtonsProps {
  tabs: { label: string; icon: MTYKIcon }[]
}

function TabButton({ children, ...rest }) {
  return <div {...rest}>{children}</div>
}

export default function TabButtons(props: TabButtonsProps) {
  const { tabs } = props
  const controller = TabController.use({
    tabs,
  })
  return (
    <Flex>
      {controller.tabs.map(tab => {
        return (
          <TabButton {...tab}>
            <Icon icon={tab.icon} />
          </TabButton>
        )
      })}
    </Flex>
  )
}
