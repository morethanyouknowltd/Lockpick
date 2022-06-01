import { ReactNative } from '../helpers/conditionalImports'
import { config } from '../helpers/config'
import React from 'react'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'

const Presser = React.forwardRef(
  (
    {
      ...rest
    }: DefaultNativeProps & {
      onPress: any
      onPressIn?: any
      onPressOut?: any
    },
    ref: any
  ) => {
    if (config.isNative) {
      const { Pressable } = ReactNative
      return <Pressable {...rest} ref={ref} />
    } else {
      const transformedProps = { ...rest }
      const map: any = {
        onPressIn: 'onMouseDown',
        onPressOut: 'onMouseUp',
        onPress: 'click',
      }
      for (const key in map) {
        if (key in transformedProps) {
          // map to new key
          transformedProps[map[key]] = transformedProps[key]
          // delete original
          delete transformedProps[key]
        }
      }
      return <div {...transformedProps} ref={ref} />
    }
  }
)

export default Presser
