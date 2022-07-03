import { InputProps } from '@mtyk/frontend/core/CoreTypes'
import compose from '@mtyk/frontend/react/helpers/compose'
import Button, { ButtonProps } from './Button'

export interface ToggleButtonProps extends Omit<ButtonProps, 'action'>, InputProps<boolean> {}
export interface ToggleButtonRefHandle {}

export default compose()(function ToggleButton(props: ToggleButtonProps) {
  const { value, onChange, defaultValue, ...rest } = props
  return (
    <Button
      {...rest}
      style={{}}
      iconProps={{}}
      action={() => {
        onChange(!value)
      }}
    />
  )
})
