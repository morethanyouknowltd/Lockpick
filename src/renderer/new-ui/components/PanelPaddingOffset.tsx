import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { newTheme } from '../helpers/newTheme'

export interface PanelPaddingOffsetProps {}
export interface PanelPaddingOffsetRefHandle {}

export default compose()(function PanelPaddingOffset(props: PanelPaddingOffsetProps) {
  const { children, ...rest } = props
  return (
    <Flex
      {...rest}
      style={{
        margin: `-${newTheme.panelPaddingYPX}px -${newTheme.panelPaddingXPX}px`,
        ...rest.style,
      }}>
      {children}
    </Flex>
  )
})
