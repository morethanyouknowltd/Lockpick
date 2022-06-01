import React from 'react'
import { Animated } from 'react-native'
import ReAnimated from 'react-native-reanimated'

export default function makeAnimated(
  Component: React.ComponentType<any>,
  re = false
) {
  try {
    const framework = re ? ReAnimated : (Animated as any)
    if (Component.prototype?.isReactComponent || Component.prototype?.render) {
      return framework.createAnimatedComponent(Component)
    }

    // This ensures our wrapped component has a recognisable name from the one it wrapped
    let localReact = React
    const Class = eval(
      `(class ${Component.name}Wrapped extends localReact.Component {});`
    )
    Object.defineProperty(Class.prototype, 'render', {
      configurable: true,
      writable: true,
      value: function render() {
        return <Component {...this.props} ref={this.props.forwardedRef} />
      },
    })
    return framework.createAnimatedComponent(
      React.forwardRef((props, ref) => <Class {...props} forwardedRef={ref} />)
    )
  } catch (e) {
    console.error('Error making animated component with ', Component)
    throw e
  }
}
export function makeReanimated(Component: React.ComponentType<any>) {
  return makeAnimated(Component, true)
}

export function wrapFunctionToClass(Component) {
  let localReact = React
  const Class = eval(
    `(class ${Component.name}Wrapped extends localReact.Component {});`
  )
  Object.defineProperty(Class.prototype, 'render', {
    configurable: true,
    writable: true,
    value: function render() {
      return <Component {...this.props} ref={this.props.forwardedRef} />
    },
  })
  return Class
}

/**
 * When Next.js support for decorators is better, this can be used as a
 * decorator which should clean things up a lot
 */
export function withAnimatedVariants<T>(
  Component: T
): T & { ReAnimated: T; Animated: T } {
  ;(Component as any).ReAnimated = makeAnimated(Component as any, true)
  ;(Component as any).Animated = makeAnimated(Component as any, false)
  return Component as any
}
