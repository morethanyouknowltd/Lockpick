import { Flex, Icon, Txt } from 'mtyk-frontend/core/components'
import { absoluteFill } from 'mtyk-frontend/styles/helpers/styleObjects'
import React, { useState } from 'react'
import * as conditionalImports from '../../../core/helpers/conditionalImports'
import unifyStyle, { unifyStyles } from '../../../react/helpers/unifyStyle'

interface ButtonProps {
  icon?: any
  children?: string
  image?: number
  disabled?: boolean
  iconColor?: string
  iconStyle?: any
  style?: any
  onPress?: () => void
  size?: number
  accent?: boolean
}

/** @deprecated Prefer using cross-platform CircularButton in core instead */
const NativeCircularButton = (props: ButtonProps) => {
  const {
    icon,
    size,
    disabled,
    image,
    accent,
    children,
    color,
    iconColor,
    iconStyle: _iconStyle,
    style: _style,
    onPress,
    ...rest
  } = props

  const {
    ReactNativeReanimated: { useAnimatedStyle, withTiming, default: Animated },
  } = conditionalImports
  const [imageLoaded, setImageLoaded] = useState(false)
  const [touched, setTouched] = useState(false)
  const style = unifyStyles(_style)
  const iconStyle = unifyStyles(_iconStyle)
  const wrapStyle = {
    flexShrink: 0,
    height: size ?? style[0]?.height ?? 50,
    width: size ?? style[0]?.width ?? 50,
    borderRadius: 999,
    overflow: 'hidden',
  }
  const tooltipStyle = useAnimatedStyle(() => {
    return {
      transform: [
        // { scale: withTiming(touched ? 1 : 0) },
        { translateX: '-50%' },
      ],
      opacity: withTiming(touched ? 1 : 0),
    }
  }, [touched])

  const imageStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(imageLoaded ? 1 : 0, { duration: 500 }),
    }
  })
  const theme = useThemeShared()
  const iconColor2 = iconColor ?? iconStyle[0]?.color ?? 'white'
  const iconSize2 = iconStyle[0]?.fontSize ?? style[0]?.fontSize ?? 16
  const bgColor = color ?? (accent ? theme.accent : style[0]?.backgroundColor ?? 'transparent')

  return (
    <WHC
      name="ScalingPressable"
      style={unifyStyle(style)}
      onPress={(...args) => (disabled ? null : onPress?.(...args))}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => setTouched(false)}
      {...rest}>
      <Flex columnCenter>
        <Animated.View
          style={{
            ...wrapStyle,
          }}>
          <Animated.View
            {...rest}
            style={{
              backgroundColor: disabled || image ? (image ? `#EEE` : '#CCC') : bgColor,
              opacity: disabled ? 0.5 : 1,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              ...absoluteFill(),
            }}>
            {icon ? <Icon color={iconColor2} size={iconSize2} icon={icon} /> : null}
            {image ? (
              <Animated.Image
                onLoadStart={() => {
                  setImageLoaded(false)
                }}
                onLoadEnd={() => {
                  setImageLoaded(true)
                }}
                style={[
                  {
                    resizeMode: 'cover',
                    height: wrapStyle.height,
                    width: wrapStyle.width,
                    ...absoluteFill(),
                  } as any,
                  imageStyle,
                ]}
                source={typeof image === 'string' ? { uri: image } : image}
              />
            ) : null}
          </Animated.View>
        </Animated.View>
        {rest.nativeTooltip ? (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: -40,
                left: '50%',
                width: rest.tooltip.length > 10 ? 120 : 110,
                zIndex: 100,
                backgroundColor: '#555',
                borderRadius: 999,
                padding: 10,
              },
              tooltipStyle,
            ]}>
            <Txt center color={'white'}>
              {rest.tooltip}
            </Txt>
          </Animated.View>
        ) : null}
      </Flex>
      {rest.tooltip && rest.tooltipAsLabel ? (
        <Txt center style={rest.labelStyle}>
          {rest.tooltip}
        </Txt>
      ) : null}
    </WHC>
  )
}

export default NativeCircularButton
