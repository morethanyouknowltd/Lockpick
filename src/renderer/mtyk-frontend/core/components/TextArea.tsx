import { ReactNative } from '../helpers/conditionalImports'
import { config } from '../helpers/config'
import React, { forwardRef } from 'react'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'

export default forwardRef(function TextArea(
  {
    onChangeText,
    onEndEditing,
    autoSize,
    ...rest
  }: DefaultNativeProps & {
    autoSize?: boolean
    placeholder?: string
    value?: string
    autoFocus?: boolean
    onChangeText: (text: string) => void
    onEndEditing?: (text: string) => void
  },
  ref
) {
  const Component = config.isNative
    ? ReactNative.TextInput
    : autoSize
    ? null
    : 'textarea'
  const platformProps = config.isNative
    ? {
        onChangeText,
        multiline: true,
        textAlignVertical: 'center',
        onEndEditing: onEndEditing
          ? ({ nativeEvent }) => {
              nativeEvent.text && onEndEditing(nativeEvent.text)
            }
          : undefined,
      }
    : {
        onChange: (e: any) => onChangeText(e.target.value),
      }
  const props = {
    ...platformProps,
    ...rest,
  }

  return <Component ref={ref} {...props} />
})
