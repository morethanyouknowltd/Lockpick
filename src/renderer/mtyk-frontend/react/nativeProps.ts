import { isNative } from 'mtyk-frontend/core/helpers'
import { mapValues } from 'lodash'
export default function nativeProps(propsOrCb) {
  if (typeof propsOrCb === 'function') {
    const fnReturn = propsOrCb(isNative)
    return fnReturn
  }
  return isNative ? propsOrCb : {}
}

export function nativeOrWeb(props) {
  if (Array.isArray(props)) {
    return props.map(nativeOrWeb)
  }
  return mapValues(props, (val, key) => {
    if (!Array.isArray(val) || key === 'transform') {
      return val
    }
    return isNative ? val[0] : val[1]
  })
}

export function webProps(propsOrCb) {
  if (typeof propsOrCb === 'function') {
    const fnReturn = propsOrCb(!isNative)
    return fnReturn
  }
  return !isNative ? propsOrCb : {}
}
