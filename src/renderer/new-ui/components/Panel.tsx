import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import React, { ComponentProps, ReactNode } from 'react'
import { newTheme } from '../helpers/newTheme'

export interface PanelProps extends ComponentProps<typeof Flex> {
  style?: React.CSSProperties
  header?: ReactNode
  children: ReactNode
}
export interface PanelRefHandle {}

export default compose()(function Panel(props: PanelProps) {
  const { style, header, children, ...rest } = props
  return (
    <Flex
      {...rest}
      style={{
        ...style,
        padding: `${newTheme.panelPaddingYPX}px ${newTheme.panelPaddingXPX}px`,
        background: '#222',
      }}>
      {header}
      <Flex grow style={{ position: 'relative' }}>
        {children}
      </Flex>
    </Flex>
  )
})
