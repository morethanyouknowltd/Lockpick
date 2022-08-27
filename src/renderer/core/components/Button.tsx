import { Flex } from '@mtyk/frontend/core/components'
import Icon, { MTYKIcon } from '@mtyk/frontend/core/components/Icon'
import { FrontendAction } from '@mtyk/frontend/core/CoreTypes'
import { border } from '@mtyk/frontend/styles/helpers/styleObjects'
import { renderWithTheme } from '@mtyk/frontend/theming'
import HoverableThing from '@mtyk/frontend/tooltips/components/HoverableThing'
import React, { ComponentProps } from 'react'
import PopoverWrap from './PopoverWrap'
import { makeActionComponent } from '@mtyk/dev-react'

export interface ButtonProps {
  borderless?: boolean
  action: FrontendAction
  children?: React.ReactNode | string
  style?: React.CSSProperties
  icon?: MTYKIcon
  iconProps?: Partial<ComponentProps<typeof Icon>>
  description: string
  iconOnRight?: boolean
}

function BaseButton(props: ButtonProps) {
  const { action, icon, iconProps, children, style, ...rest } = props
  const renderIcon = () =>
    icon ? renderWithTheme(icon, { icon }, () => <Icon icon={icon} {...iconProps} />) : null

  return (
    <HoverableThing
      tooltip={props.description ? <PopoverWrap>{props.description}</PopoverWrap> : null}>
      <Flex
        {...rest}
        style={{ ...style, cursor: 'pointer', display: 'inline-flex', width: 'fit-content' }}
        onClick={action}>
        {!props.iconOnRight && renderIcon()}
        {children}
        {props.iconOnRight && renderIcon()}
      </Flex>
    </HoverableThing>
  )
}

export default makeActionComponent(function LockpickButton(props: ButtonProps) {
  return (
    <BaseButton
      {...props}
      iconProps={{
        color: '#BE76E0',
        ...props.iconProps,
      }}
      style={{
        ...props.style,

        ...(props.borderless ? {} : border(1, '#5C4A6A', 'solid')),
        borderRadius: '.5em',
        padding: props.borderless ? '0' : '.7em',
      }}
    />
  )
}, {})
