import { HoverableThing } from 'mtyk-frontend/tooltips/components/HoverableThing'
import React, { createElement, useState } from 'react'
import NativeCircularButton from '../../native/core/components/CircularButton'
import isNative from '../helpers/isNative'
import Flex from './Flex'
import Icon, { MTYKIcon } from './Icon'
import Txt from './Txt'
export interface CircularButtonProps {
  icon: MTYKIcon
  action: () => void
  size?: number
  color?: string
  backgroundColor?: string
  disabled?: boolean
  style?: any
  iconColor?: string
  iconStyle?: any
  hoverColor?: string
  tooltipAsLabel?: boolean
  tooltip?: string
  children?: string
}

export default function CircularButton(props: CircularButtonProps) {
  const {
    size,
    children,
    style,
    disabled,
    action,
    icon,
    iconStyle,
    iconColor,
    color,
    tooltipAsLabel,
    hoverColor,
    tooltip,
    ...rest
  } = props
  const [toggleHover, setToggleHover] = useState(false)
  const onPressClick = () => {
    if (!disabled) {
      action?.()
    }
  }
  if (isNative) {
    // HERE
    return createElement(NativeCircularButton, {
      ...props,
      onPress: onPressClick,
    })
  } else {
    const wrapStyle = {
      flexShrink: 0,
      height: size ?? style?.height ?? 50,
      width: size ?? style?.width ?? 50,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: color ?? style?.backgroundColor ?? undefined,
      position: 'relative',
      cursor: 'pointer',
      opacity: disabled ? 0.5 : 1,
    }

    const hoverOverrideColor =
      hoverColor && toggleHover ? hoverColor : iconColor
    const iconStyle2 = {
      ...iconStyle,
      color: hoverOverrideColor ?? iconStyle?.color ?? 'white',
      fill: hoverOverrideColor ?? iconStyle?.fill ?? 'white',
      stroke: hoverOverrideColor ?? iconStyle?.stroke ?? 'white',
    }
    return (
      <HoverableThing tooltip={tooltip}>
        <Flex onClick={onPressClick} center noRelative>
          <Flex
            onMouseEnter={() => setToggleHover(true)}
            onMouseLeave={() => setToggleHover(false)}
            center
            style={{ ...wrapStyle, ...style }}
            {...rest}
          >
            {icon ? (
              <Icon
                style={iconStyle2}
                size={iconStyle?.fontSize ?? style?.fontSize ?? 16}
                icon={icon}
              />
            ) : null}
          </Flex>
          {tooltipAsLabel ? (
            <Txt medium center size={12} style={{ width: '100%' }}>
              {children}
            </Txt>
          ) : null}
        </Flex>
      </HoverableThing>
    )
  }
}
