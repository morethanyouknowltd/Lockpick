import _, { mapValues } from 'lodash'
import { nativeOrWeb } from 'mtyk-frontend/react/nativeProps'
import { lineClamp } from 'mtyk-frontend/styles/helpers/styleObjects'
import React, { forwardRef } from 'react'
import { useStyleContext } from '../../core/contexts/StyleContext'
import { unifyStyles } from '../../react/helpers/unifyStyle'
import { isNative } from '../helpers'
import { ReactNative } from '../helpers/conditionalImports'
import { config } from '../helpers/config'
import makePropDeleter from '../helpers/deleteOwnProps'
import Flex from './Flex'

export const fontWeightMap = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 800,
} as const
export type FontWeightArgs = {
  [K in keyof typeof fontWeightMap]: boolean | undefined
}

export type TxtProps = FontWeightArgs & {
  weight?: 300 | 400 | 500 | 700
  /** On native, wraps in a <Flex> tag so it behaves like a web "block" element */
  block?: boolean
  webOnly?: boolean
  nativeOnly?: boolean
  ellipsisAt?: number
}

export const defaultFontWeight = 400
const propDeleter = makePropDeleter({
  ...mapValues(fontWeightMap, (val) => ({ fontWeight: val })),
  center: { textAlign: 'center', alignSelf: 'center' },
  size: 'fontSize',
  color: 'color',
  uppercase: { textTransform: 'uppercase' },
  lowercase: { textTransform: 'lowercase' },
  capitalise: { textTransform: 'capitalize' },
  underline: { textDecorationLine: 'underline' },
  capitalize: { textTransform: 'capitalize' },
  oneLiner: lineClamp(1),
})

const Txt = forwardRef(function Txt(props: TxtProps & any, ref) {
  let TextComponent
  if (props.webOnly && isNative) {
    return null
  } else if (props.nativeOnly && !isNative) {
    return null
  }

  if (config.isNative) {
    TextComponent = ReactNative.Text
  } else {
    TextComponent = 'span'
  }

  const mapOrMapValues = (arrOrObj, cb) =>
    Array.isArray(arrOrObj) ? arrOrObj.map(cb) : _.mapValues(arrOrObj, cb)
  const [context, { mapStyles }] = useStyleContext()

  const { transformed: ourStyle, clonedProps } = propDeleter(props)
  if (config.isNative) {
    ourStyle.fontFamily =
      config.fontMap?.[ourStyle.fontWeight ?? defaultFontWeight] ??
      defaultFontWeight

    delete ourStyle.fontWeight
  }
  if (context && 'fontSize' in context) {
    ourStyle.fontSize = context.fontSize * (context.scale ?? 1)
  }
  if (context && 'color' in context) {
    ourStyle.color = context.color
  }

  const Wrap = clonedProps.block ? Flex : React.Fragment
  let children = clonedProps.children

  if (clonedProps.ellipsisAt) {
    delete clonedProps.ellipsisAt
    const ellipsisStr = (str: string, max: number) => {
      if (str.length > max) {
        return str.slice(0, max) + '...'
      }
      return str
    }
    children = ellipsisStr(children as string, clonedProps.ellipsisAt)
  }

  return (
    <Wrap>
      <TextComponent
        {...clonedProps}
        ref={ref}
        style={mapOrMapValues(
          unifyStyles(ourStyle, nativeOrWeb(clonedProps.style)),
          mapStyles
        )}
      >
        {children}
      </TextComponent>
    </Wrap>
  )
})

export default Txt
