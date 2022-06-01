import _ from 'lodash'
import { rInterpObject } from '../../../native/animation/helpers/interp'
import makeTransformStyles from '../../..//native/animation/helpers/makeTransformStyles'
import { unifyStyles } from '../../..//react/helpers/unifyStyle'
import React, { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import Flex from '../../../core/components/Flex'
import { makeReanimated } from '../helpers/makeAnimated'
export const AnimatedFlex = makeReanimated(Flex)
export const AnimatedPressable = makeReanimated(Pressable)

export function AnimatedPressableSpecial({
  pressedStyle: _pressedStyle,
  unpressedStyle: _unpressedStyle,
  ...rest
}) {
  const [pressed, setPressed] = useState(false)
  const delta = useSharedValue(0)
  const pressedStyle = makeTransformStyles(_pressedStyle)
  const unpressedStyle = makeTransformStyles(_unpressedStyle)

  useEffect(() => {
    delta.value = withTiming(pressed ? 1 : 0, { duration: 100 })
  }, [pressed])
  const style = useAnimatedStyle(() => {
    const s = rInterpObject(unpressedStyle, pressedStyle, delta.value)
    //
    return s
  }, [delta])

  return (
    <AnimatedPressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...rest}
      style={[style, ...unifyStyles(rest.style)]}
    />
  )
}

export function AnimatedFlexOnOff({
  onStyle: _onStyle,
  offStyle: _offStyle,
  value,
  children,
  ...rest
}: {
  onStyle?: any
  offStyle?: any
  value: boolean
} & React.ComponentProps<typeof Flex>) {
  const delta = useSharedValue(0)
  const onStyle = makeTransformStyles(_onStyle)
  const offstyle = makeTransformStyles(_offStyle)
  useEffect(() => {
    delta.value = withTiming(value ? 1 : 0, { duration: 300 })
  }, [value])
  const style = useAnimatedStyle(() => {
    const s = rInterpObject(offstyle, onStyle, delta.value)
    return s
  }, [delta, onStyle, offstyle])

  return (
    <AnimatedFlex {...rest} style={[style, rest.style]}>
      {children}
    </AnimatedFlex>
  )
}
