export default function plural(num: number, noun: string) {
  if (num === 1) {
    return `1 ${noun}`
  } else if (num === 0) {
    return `No ${noun}s`
  } else {
    return `${num} ${noun}s`
  }
}
