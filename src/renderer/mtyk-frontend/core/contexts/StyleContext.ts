import React, { useContext } from 'react'
import _ from 'lodash'

const StyleContext = React.createContext<
  { scale: number; fontSize: number } | undefined
>(null)
export default StyleContext

const sizeyKeys = new Set([
  'height',
  'width',
  'fontSize',
  'padding',
  'margin',
  'maxWidth',
  'maxHeight',
  'lineHeight',
])

export const useStyleContext = (override?: any) => {
  const _context = useContext(StyleContext)
  const context = override ?? _context
  const mapValToContext = (val, key) => {
    if (typeof val === 'number' && sizeyKeys.has(key)) {
      return val * (context?.scale ?? 1)
    }
    return val
  }
  return [
    context,
    {
      mapStyles: (styles) =>
        context ? _.mapValues(styles, mapValToContext) : styles,
    },
  ]
}
