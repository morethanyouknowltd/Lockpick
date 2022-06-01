function coerceArray(value) {
  if (Array.isArray(value)) {
    return value
  }
  return [value]
}

export default function classNames(...str: any[]) {
  return coerceArray(str)
    .filter(s => !!s)
    .join(' ')
}
