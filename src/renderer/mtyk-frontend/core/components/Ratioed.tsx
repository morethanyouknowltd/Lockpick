import { DefaultProps } from 'mtyk-frontend/native/MTYKNativeTypes'
import { percentage } from 'mtyk-frontend/strings'
import React, { ComponentType, useState } from 'react'

import { unifyStyle } from '../../react'
import { absoluteFill } from '../../styles/helpers/styleObjects'
import { config } from '../helpers/config'
import Flex from './Flex'

export default function Ratioed({
  widthToHeight: _widthToHeight,
  component: Component,
  childStyle,
  ...rest
}: DefaultProps.Style & {
  /** Defaults to 1, equal height/width */
  widthToHeight?: number
  childStyle: DefaultProps.Style['style']
  component: ComponentType<any>
}) {
  const [layout, setLayout] = useState()
  const widthToHeight = _widthToHeight ?? 1
  if (config.isNative) {
    return (
      <Component
        onLayout={({ nativeEvent }) => {
          setLayout(nativeEvent.layout)
        }}
        {...rest}
        style={unifyStyle(
          layout
            ? {
                height: (1 / widthToHeight) * layout.width,
              }
            : {
                paddingBottom: (widthToHeight - 1) * 100 + '%',
              },
          rest.style ?? {}
        )}
      />
    )
  } else {
    const percentageToFrac = parseFloat(rest.style?.width ?? '100%') / 100

    return (
      <Flex
        className="Ratioed"
        center
        style={{
          paddingBottom: percentage(percentageToFrac / widthToHeight),
          width: percentage(percentageToFrac),
          position: 'relative',
          ...(rest.style ?? {}),
        }}
      >
        <Component
          {...rest}
          style={{ ...(childStyle ?? {}), width: undefined, ...absoluteFill() }}
        />
      </Flex>
    )
  }
}
