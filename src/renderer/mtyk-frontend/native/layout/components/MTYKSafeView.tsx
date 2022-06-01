import React, { useContext } from 'react'
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
} from 'react-native-safe-area-context'
import { unifyStyles } from '../../../react/helpers/unifyStyle'
import { Flex } from '../../../core/components'
import _ from 'lodash'
import type { DefaultNativeProps } from '../../MTYKNativeTypes'

/**
 * The built in safe view seems to flicker between route changes, hopefully this
 * stays consistent
 */
export default function MTYKSafeView({
  children,
  style,
  disabled,

  ...rest
}: DefaultNativeProps & {
  vertical?: number
  horizontal?: number
  top?: number
  disabled?: boolean
  left?: number
  bottom?: number
  right?: number
}) {
  const { top, vertical, horizontal, bottom, left, right } = rest

  const directions = ['top', 'bottom', 'left', 'right']
  const insets = {
    top: top ?? vertical ?? 0,
    left: left ?? horizontal ?? 0,
    bottom: bottom ?? vertical ?? 0,
    right: right ?? horizontal ?? 0,
  }
  // const areaContext = useContext(SafeAreaFrameContext)
  const insetContext = useContext(SafeAreaInsetsContext)
  if (disabled) {
    return <>{children}</>
  }
  const modInsets = _(directions)
    .map((dir) => [
      `padding${_.capitalize(dir)}`,
      rest[dir] === null ? 0 : insets[dir] + (insetContext?.[dir] ?? 0),
    ])
    .fromPairs()
    .value()

  return (
    <SafeAreaInsetsContext.Provider value={modInsets}>
      <Flex
        {...rest}
        style={[
          {
            flex: 1,
            ...modInsets,
          },
          ...unifyStyles(style),
        ]}
      >
        {children}
      </Flex>
    </SafeAreaInsetsContext.Provider>
  )
}

MTYKSafeView.spy = ({ children }) => {
  const context = useContext(SafeAreaInsetsContext)
  return children(context)
}
