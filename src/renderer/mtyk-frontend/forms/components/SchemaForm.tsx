import schemaToDefault from '../../data/helpers/schemaToDefault'
import type { PropsWithoutRef, ReactNode } from 'react'
import React from 'react'
import type { FormProps as FinalFormProps } from 'react-final-form'
import { Form as FinalForm } from 'react-final-form'
import type * as z from 'zod'
import { Txt } from 'mtyk-frontend/core/components'
export { FORM_ERROR } from 'final-form'

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements['form']>, 'onSubmit'> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText?: string
  schema: S
  onSubmit?: FinalFormProps<z.infer<S>>['onSubmit']
  initialValues?: FinalFormProps<z.infer<S>>['initialValues']
  values: any
}

export function SchemaForm<S extends z.ZodType<any, any>>({
  children,
  schema,
  validate,
  ...rest
}: FormProps<S>) {
  return (
    <FinalForm
      onSubmit={rest.onSubmit ?? (() => {})}
      initialValues={
        rest.initialValues ?? rest.defaultValues ?? schemaToDefault(schema)
      }
      validate={(values) => {
        if (!schema) return
        try {
          schema.parse(values)
        } catch (error) {
          return error.formErrors.fieldErrors
        }
        if (validate) {
          return validate(values)
        }
      }}
      {...rest}
    >
      {children}
    </FinalForm>
  )
}

export default SchemaForm
