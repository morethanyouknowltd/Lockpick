import React from 'react'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'
import { Field, FormSpy } from 'react-final-form'
import Flex from '../../core/components/Flex'

export default function ArrayField<T>({
  name: arrFieldName,
  children,
  addButton,
  template,
  allowNone,
  includeHeaderRow,
}: {
  template?: (i: number) => T
  addButton?: any
  allowNone?: boolean
  /**
   * If true, will include a call to children with an extra {isHeader: true} field purely to show headers
   */
  includeHeaderRow?: boolean
  name: string
} & DefaultNativeProps) {
  return (
    <Field name={arrFieldName}>
      {props => {
        if (!Array.isArray(props.input.value)) {
          console.warn(`Value for field "${arrFieldName}" was not an array`)
          return <Flex>Not an array</Flex>
        }
        const arr = props.input.value
        const length = arr.length
        return (
          <FormSpy subscription={{}}>
            {({ form }) => {
              const onAdd = (item?: T) => {
                form.change(`${arrFieldName}.${length}`, item ?? template?.(length) ?? {})
              }
              const onRemove = i => {
                if (i > 0 || allowNone) {
                  const newArr = arr.slice()
                  newArr.splice(i, 1)
                  form.change(arrFieldName, newArr)
                }
              }
              const mapItem = (el, i, extra = {}) => {
                if (!el) {
                  console.warn(`Element ${i} did not exist`)
                  return null
                }
                return children({
                  index: i,
                  value: el,
                  key: el?._id ?? i,
                  name: (subField: string) => `${arrFieldName}.${i}.${subField}`,
                  onAdd,
                  onRemove: () => onRemove(i),
                  ...extra,
                })
              }
              return (
                <Flex>
                  {includeHeaderRow && length > 0 ? mapItem(arr[0], 0, { isHeader: true }) : null}
                  {props.input.value.map(mapItem)}
                  {addButton && React.cloneElement(addButton, { action: onAdd })}
                </Flex>
              )
            }}
          </FormSpy>
        )
      }}
    </Field>
  )
}
