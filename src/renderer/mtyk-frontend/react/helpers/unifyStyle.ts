import _ from 'lodash'
import { config } from '../../core/helpers/config'

/**
 * If on native, ensures all styles are "array style" so they can be combined with others.
 *
 * In browser, just merges styles as normal
 */
export default function unifyStyle(...style: any[]) {
  if (!config.isNative) {
    if (Array.isArray(style)) {
      return _.flattenDeep(style).reduce((prev, curr) => ({ ...prev, ...curr }))
    }
    return style
  }
  if (typeof style === 'undefined' || style === null) {
    return []
  }
  if (!Array.isArray(style)) {
    return [style]
  }
  return _.flattenDeep(style).filter(s => !!s)
}

export function unifyStyles(...styles: any[]) {
  return unifyStyle(styles)
}
