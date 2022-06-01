import _, { mapValues } from 'lodash'
export default function parseDates(o) {
  if (typeof o === 'undefined' || o === null || typeof o !== 'object') {
    return o
  }
  if (Array.isArray(o)) {
    return o.map(parseDates)
  }
  return mapValues(o, (value, key) => {
    if (
      typeof value === 'string' &&
      value.startsWith('202') &&
      value.endsWith('Z')
    ) {
      const asDate = new Date(value)
      if (!isNaN(asDate.getTime())) {
        return asDate
      }
    } else if (typeof value === 'object' && !!value) {
      return parseDates(value)
    }
    return value
  })
}
