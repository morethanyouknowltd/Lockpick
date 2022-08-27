import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'

export interface PopoverWrapProps {
  children: any
}
export interface PopoverWrapRefHandle {}

export default compose()(function PopoverWrap(props: PopoverWrapProps) {
  const { children } = props
  return (
    <Flex
      padding={[10, 10]}
      style={{
        borderRadius: '.5em',
        zIndex: 99999,
        background: 'black',
      }}>
      {children}
    </Flex>
  )
})
