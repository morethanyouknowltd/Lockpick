export default function assert(
  cond: any,
  message?: any,
  err?: any
): asserts cond {
  if (!cond) {
    throw err ?? new Error(message ?? `assertDefined failed`)
  }
}
