import React from 'react'
import { Txt, Flex, Icon } from '@mtyk/frontend/core/components'
import SidebarModsList from './SidebarModsList'

export interface SidebarProps {}

export default function Sidebar(props: SidebarProps) {
  const {} = props
  return (
    <Flex
      style={{
        overflow: 'auto',
        background: '#222',
        height: '100vh',
        width: '20em',
        padding: '5em 2.5em',
        paddingRight: '4em',
      }}>
      <SidebarModsList />
    </Flex>
  )
}
