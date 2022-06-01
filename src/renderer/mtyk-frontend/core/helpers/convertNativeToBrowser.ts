const simpleKeys = new Set(['flexGrow', 'flexShrink'])
export default function convertNativeToBrowser(val: any, key = '') {
  if (simpleKeys.has(key)) {
    return val
  }
  if (typeof val === 'number') {
    return val / 16 + 'em'
  }
  return val
}
