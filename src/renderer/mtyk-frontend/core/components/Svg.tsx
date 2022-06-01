import { capitalize } from 'lodash'
import React, { Children, cloneElement, createElement } from 'react'
import { DefaultProps } from '../../native/MTYKNativeTypes'
import isNative from '../helpers/isNative'
import * as conditionalImports from '../helpers/conditionalImports'

export interface SvgProps extends DefaultProps.Children {}

function transformToNativeProps(props) {
  let out = {}
  for (const key in props) {
    if (key.indexOf('-')) {
      // Convert dashed props to camel case
      const camelCaseKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase())
      out[camelCaseKey] = props[key]
    }
  }
  return out
}

function ToNativeSvgElements({ children, ...rest }) {
  const array = Children.toArray(children)
  // console.log({ children: array.map(a => a.type) })
  const nativeComponents = conditionalImports.ReactNativeSvg

  return (
    <>
      {array.map((child, index) => {
        const { type } = child
        const capitalized = capitalize(type)
        if (capitalized in nativeComponents) {
          const NativeComponent = nativeComponents[capitalized]
          const transformedProps = transformToNativeProps(child.props)

          return createElement(NativeComponent, {
            ...transformedProps,
            ...rest,
            key: index,
            children: (
              <ToNativeSvgElements>{child.props.children}</ToNativeSvgElements>
            ),
          })
        } else {
          console.warn(`No native component found for SVG with tag "${type}"`)
          return null
        }
      })}
    </>
  )
}

function NativeOrBrowserSvg({ children, ...rest }) {
  return isNative ? (
    <ToNativeSvgElements {...rest}>{children}</ToNativeSvgElements>
  ) : (
    Children.toArray(children).map((child, index) =>
      cloneElement(child, { ...rest, key: index })
    )
  )
}

export default function Svg(props: SvgProps) {
  const { children, ...rest } = props
  const firstChild = Children.toArray(children)[0]
  if (firstChild.type === 'svg') {
    // Allow passing in complete, browser style svgs to simplify copy and paste
    return <NativeOrBrowserSvg {...rest}>{children}</NativeOrBrowserSvg>
  } else {
    // Or we can create the svg el for them
    return (
      <NativeOrBrowserSvg {...rest}>
        <svg>{children}</svg>
      </NativeOrBrowserSvg>
    )
  }
}
