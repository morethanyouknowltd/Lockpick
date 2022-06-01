import { isNative } from 'mtyk-frontend/core/helpers'
import { createElement } from 'react'
import * as conditionalImports from '../../core/helpers/conditionalImports'
interface InputTextProps {}

export default function InputText(props: InputTextProps) {
  if (isNative) {
    return createElement(conditionalImports.ReactNative.TextInput, props)
  } else {
    return createElement('input', {
      ...props,
      onChange: props.onChangeText
        ? event => {
            props.onChangeText(event.target.value)
          }
        : props.onChange,
    })
  }
}
