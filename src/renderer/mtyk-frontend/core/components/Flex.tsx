import _ from 'lodash'
import { nativeOrWeb } from 'mtyk-frontend/react/nativeProps'
import { border } from 'mtyk-frontend/styles/helpers/styleObjects'
import React from 'react'
import { unifyStyles } from '../../react/helpers/unifyStyle'
import { useStyleContext } from '../contexts/StyleContext'
import { ReactNative } from '../helpers/conditionalImports'
import { config } from '../helpers/config'
import convertNativeToBrowser from '../helpers/convertNativeToBrowser'
import makePropDeleter from '../helpers/deleteOwnProps'

// Even shorter-hands
let shorterHands = {
  rc: 'rowCenter',
  b: 'between',
  r: 'row',
  w: 'wrap',
  c: 'column',
  cc: 'columnCenter',
  fw: 'fullWidth',
}
const propDeleter = makePropDeleter(
  {
    direction: 'flexDirection',
    grow: value => ({
      flexGrow: typeof value === 'boolean' ? (value ? 1 : 0) : value,
    }),
    shrink: value => ({
      flexShrink: typeof value === 'boolean' ? (value ? 1 : 0) : value,
    }),
    stretch: { alignItems: 'stretch' },
    wrap: { flexWrap: 'wrap' },
    start: { alignItems: 'start' },
    end: { alignItems: 'end' },
    rowCenter: { alignItems: 'center', flexDirection: 'row' },
    columnCenter: { alignItems: 'center', flexDirection: 'column' },
    column: { flexDirection: 'column' },
    row: { flexDirection: 'row' },
    inline: { display: 'inline-flex' },
    between: { justifyContent: 'space-between' },
    jEnd: { justifyContent: 'flex-end' },
    jStart: { justifyContent: 'flex-start' },
    columnReverse: { flexDirection: 'column-reverse' },
    fullWidth: { width: '100%' },
    rowReverse: { flexDirection: 'row-reverse' },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    ..._(['alignItems', 'justifyContent', 'flex'].map(i => [i, i]))
      .fromPairs()
      .value(),
  },
  shorterHands
)

type SHTypes = { [K in keyof typeof shorterHands]: boolean }
interface FlexProps extends SHTypes {
  column?: boolean
  row?: boolean
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'wrap' | 'nowrap'
  center?: boolean
  alignItems?: string
  alignSelf?: string
  alignContent?: string
  justifyContent?: string
  /**
   * Don't add 'position: relative' to this element (by default we add it to
   * match up with React Native views)
   */
  noRelative?: boolean

  width?: string
  height?: string
  padding?: string
  gap?: number
  flex?: number
  context?: { scale: number }
  as?: any
}

// const debug = true
const debug = false
let _Flex: any
const Flex = React.forwardRef(function Flex(props: FlexProps & any, ref) {
  let ViewComponent
  if (config.isNative) {
    ViewComponent = ReactNative.View
  } else {
    ViewComponent = 'div'
  }
  const [nearestContext, { mapStyles }] = useStyleContext(props.context)

  let extraProps: any = {}
  const { clonedProps, transformed } = propDeleter(props)

  // Check gap separately because it affects children only
  const gap = clonedProps.gap
  delete clonedProps.gap

  if (!transformed.flexDirection) {
    // Set default flex direction to column for consistency with react-native
    transformed.flexDirection = 'column'
  }

  for (const shorthand of ['margin', 'padding']) {
    if (typeof clonedProps[shorthand] !== 'undefined') {
      const _val = clonedProps[shorthand]
      const val = Array.isArray(_val) ? _val : String(_val).split(' ')

      if (!config.isNative) {
        transformed[shorthand] = val.map(el => convertNativeToBrowser(parseFloat(el))).join(' ')
        delete clonedProps[shorthand]
      } else {
        transformed[shorthand + 'Vertical'] = parseFloat(val[0])
        transformed[shorthand + 'Horizontal'] = parseFloat(val[1])
        delete clonedProps[shorthand]
      }
    }

    for (const innerShorthand of ['Vertical', 'Horizontal']) {
      const key = `${shorthand}${innerShorthand}`
      if (key in clonedProps.style) {
        const val = clonedProps.style[key]
        if (innerShorthand === 'Vertical') {
          for (const end of ['Top', 'Bottom']) {
            transformed[shorthand + end] = val + (clonedProps.style[shorthand + end] ?? 0)
          }
        } else if (innerShorthand === 'Horizontal') {
          for (const end of ['Left', 'Right']) {
            transformed[shorthand + end] = val + (clonedProps.style[shorthand + end] ?? 0)
          }
        }
        delete clonedProps.style[key]
      }
    }
  }

  if (typeof gap !== 'undefined') {
    if (config.isNative) {
      extraProps.children = React.Children.map(clonedProps.children, (child, index) => {
        if (child == null || typeof child === 'undefined') {
          return child
        }
        return React.cloneElement(child, {
          style: unifyStyles(child.props?.style, {
            [transformed.flexDirection === 'row' ? 'marginLeft' : 'marginTop']:
              index !== 0 ? gap : 0,
          }),
        })
      })
    } else {
      clonedProps.style.gap = gap
    }
  }

  if (!config.isNative) {
    // Web only
    if ('shadowRadius' in clonedProps.style) {
      const { style } = clonedProps

      transformed.boxShadow = `${convertNativeToBrowser(
        style.shadowOffset.width
      )} ${convertNativeToBrowser(style.shadowOffset.height)} ${convertNativeToBrowser(
        style.shadowRadius
      )} rgba(0, 0, 0, ${style.shadowOpacity})`
      delete style.shadowOffset
      delete style.shadowRadius
      delete style.shadowColor
      delete style.shadowOpacity
    }
  }

  if (debug) {
    // console.log('yes')
    Object.assign(transformed, border(1, 'red'))
  }

  const mapOrMapValues = (arrOrObj, cb) =>
    Array.isArray(arrOrObj) ? arrOrObj.map(cb) : _.mapValues(arrOrObj, cb)
  const style = mapOrMapValues(
    unifyStyles(
      nativeOrWeb(clonedProps.style),
      config.isNative ? transformed : _.mapValues(transformed, convertNativeToBrowser),
      config.isNative
        ? {}
        : {
            position:
              clonedProps.style?.position ?? (clonedProps.noRelative ? undefined : 'relative'),

            display: props.inline ? 'inline-flex' : 'flex',
          }
    ),
    mapStyles
  )

  const TheComponent = clonedProps?.as ?? ViewComponent
  delete clonedProps.errorBoundary

  const allProps = {
    ...clonedProps,
    ...extraProps,
    style,
    ref,
  }

  return React.createElement(TheComponent, allProps)
})
_Flex = Flex

export default Flex
