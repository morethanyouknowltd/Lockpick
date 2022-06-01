export default function omitProps<K extends string>(props: any, keys: K[]) {
  let omitted: Partial<{ [key in K]: any }> = {}

  for (const key of keys) {
    if (key in props) {
      omitted[key] = props[key]
      delete props[key]
    }
  }

  return {
    incl: props,
    excl: [omitted],
  }
}
