import { Flex } from '@mtyk/frontend/core/components'
import Icon, { MTYKIcon } from '@mtyk/frontend/core/components/Icon'
import { FrontendAction } from '@mtyk/frontend/core/CoreTypes'
import { border } from '@mtyk/frontend/styles/helpers/styleObjects'
import { renderWithTheme } from '@mtyk/frontend/theming'
import React, { ComponentProps } from 'react'
import HoverableThing from '@mtyk/frontend/tooltips/components/HoverableThing'

export interface ButtonProps {
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
    <HoverableThing tooltip={props.description ?? 'hasldkasld'}>
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

export default function LockpickButton(props: ButtonProps) {
  return (
    <BaseButton
      {...props}
      iconProps={{
        color: '#BE76E0',
      }}
      style={{
        ...props.style,

        ...border(1, '#5C4A6A', 'solid'),
        borderRadius: '.5em',
        padding: '.7em',
      }}
    />
  )
}
