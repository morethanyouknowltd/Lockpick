import React from 'react'
import { Txt, Flex, Icon } from '@mtyk/frontend/core/components'
import SidebarModsList from './SidebarModsList'

export interface SidebarProps {}

export default function Sidebar(props: SidebarProps) {
  const {} = props
  return (
    <Flex>
      <SidebarModsList />
    </Flex>
  )
}
