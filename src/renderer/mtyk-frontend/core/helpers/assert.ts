/**
 * @deprecated Prefer using typed-assert npm package
 */
export default function assert(
  cond: boolean,
  message?: any,
  err?: any
): asserts cond {
  if (!cond) {
    throw err ?? new Error(message)
  }
}
