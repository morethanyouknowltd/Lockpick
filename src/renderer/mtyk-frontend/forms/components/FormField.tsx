import React from 'react'
import { Field } from 'react-final-form'
export default function FormField(props) {
  const { children, ...rest } = props
  return (
    <Field {...rest}>
      {(props) => {
        return React.cloneElement(React.Children.only(children), props)
      }}
    </Field>
  )
}
