import compose from '@mtyk/frontend/react/helpers/compose'
import { Txt } from '@mtyk/frontend/core/components'
import { FrontendAction } from '@mtyk/frontend/core/CoreTypes'

export interface TextButtonProps {
  children: React.ReactNode
  action: FrontendAction
}

export default compose()(function TextButton(props: TextButtonProps) {
  const { children, action } = props
  return <Txt onClick={action}>{children}</Txt>
})
