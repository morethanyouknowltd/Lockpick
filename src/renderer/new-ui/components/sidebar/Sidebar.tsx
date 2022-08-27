import React from 'react'
import { Txt, Flex, Icon } from '@mtyk/frontend/core/components'
import SidebarModsList from './SidebarModsList'
import SidebarButtons from './SidebarButtons'

export interface SidebarProps {}
function SidebarSection({ children, ...rest }) {
  return (
    <Flex
      {...rest}
      style={{
        width: '100%',
        borderBottom: '1px solid #333',
        padding: '0 2.5em',
        paddingBottom: '1em',
        ...rest.style,
      }}>
      {children}
    </Flex>
  )
}

export default function Sidebar(props: SidebarProps) {
  const {} = props
  return (
    <Flex
      justifyContent="stretch"
      alignItems="stretch"
      style={{
        background: '#222',
        height: '100vh',
        width: '20em',
        paddingTop: '3em',
      }}>
      <SidebarSection>
        <input
          type="search"
          placeholder="Search..."
          style={{
            borderRadius: '999em',
            background: '#000',
            padding: '.6em 1.2em',
            color: '#eee',
            outline: 'none',
            border: 'none',
            marginBottom: '1em',
          }}
        />
      </SidebarSection>
      <SidebarSection grow style={{ overflowY: 'auto' }}>
        <SidebarModsList />
      </SidebarSection>
      <SidebarSection
        style={{ height: '7.5em', paddingTop: 0, paddingBottom: 0 }}
        justifyContent="center">
        <SidebarButtons />
      </SidebarSection>
    </Flex>
  )
}
