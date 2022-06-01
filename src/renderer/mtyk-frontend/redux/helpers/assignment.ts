import type { PayloadAction } from "@reduxjs/toolkit";
import _ from 'lodash'

export const makeAssignment = <S>(state: S) => <T>(field: string & keyof S) => (state: S, action: PayloadAction<T>) => {
  _.set(state, field, action.payload)
  // state[field] = action.payload
}

export const makeSpreadableAssignment = <S>(state: S) => <Field extends string & keyof S, T>(field: Field) => (state: S, action: PayloadAction<T>): {
    [K in `set${Capitalize<Field>}`]: any
} => {
  // dunno how to make typescript happy here
  const name = field
  return {
    ['set' + name[0].toUpperCase() + name.substr(1)]: (state, action) => {
      // state[field] = action.payload
      _.set(state, field, action.payload)
    }
  }
}

const assignment = <T>(field: string) => (state: any, action: PayloadAction<T>) => {
  state[field] = action.payload
}

export default assignment
