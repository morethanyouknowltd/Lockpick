export const isObjectLike = (value: any): value is object => {
  return value != null && typeof value === 'object'
}

export const getTag = (value: any): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }
  return Object.prototype.toString.call(value)
}

export const isDate = (value: any): value is Date => {
  return isObjectLike(value) && getTag(value) === '[object Date]'
}
