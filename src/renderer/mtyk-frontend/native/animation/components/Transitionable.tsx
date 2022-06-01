import { AnimatedFlex } from '../../../native/animation/components/AnimatedComponents'
import _ from 'lodash'
import React, { useEffect, useRef } from 'react'
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { rInterpObject } from '../../../native/animation/helpers/interp'
import { unifyStyles } from '../../../react/helpers/unifyStyle'
import { Flex } from '../../../core/components'
import makeTransformStyles from '../helpers/makeTransformStyles'

function Transitionable({
  exitAt,
  offAt,
  enter: _enter,
  id,
  on: _on,
  exit: _exit,
  duration,
  ...rest
}) {
  const [on, exit, enter] = [_on, _exit, _enter].map(makeTransformStyles)

  const delta = useSharedValue(-1)
  const lastId = useRef(id)
  useEffect(() => {
    if (id !== lastId.current) {
      // Reset incase same transitionable is used for different child
      lastId.current = id
      delta.value = -1
    }

    if (!exitAt) {
      // then it should enter
      // console.log('enter transition')
      delta.value = withTiming(0, { duration })
    } else {
      // console.log('exit transition')
      const duration = offAt - exitAt
      delta.value = withTiming(1, { duration })
    }
  }, [exitAt, id])

  const style = useAnimatedStyle(() => {
    const newChild = id !== lastId.current
    // console.log({ newChild })
    //
    if (exitAt && !newChild) {
      // exiting
      // console.log('exiting')
      const [from, to] = [on, exit]
      const offDelta = delta.value
      const out = rInterpObject(from, to, offDelta)
      //
      // console.log({ out })
      return out
    } else {
      // console.log('entering')
      // assume entering/on
      const [from, to] = [enter, on]
      const onDelta = newChild ? -1 : delta.value + 1
      const out = rInterpObject(from, to, onDelta)
      //
      // console.log({ out })
      return out
    }
  })

  const [child] = React.Children.toArray(rest.children)
  const childType = child.type
  if (childType === AnimatedFlex) {
    // If the child is already an animatable type, no need to wrap it (so we don't mess with layout)
    return React.cloneElement(child, {
      style: [...unifyStyles(child.props?.style ?? {}), style],
    })
  }

  const isFlex = childType === Flex
  return (
    <AnimatedFlex
      {...rest}
      {...(isFlex ? child.props : {})}
      style={unifyStyles(style, child.props?.style ?? {}, rest.style ?? {})}
    >
      {rest.children}
    </AnimatedFlex>
  )
}

export default Transitionable
