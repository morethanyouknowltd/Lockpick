export default function nonEmptyStr(str: any): str is string {
  return typeof str === 'string' && str.trim().length > 0
}
