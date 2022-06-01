import unifyStyle from "./unifyStyle";

export default function omitStyles<K extends string>(styles: any, keys: K[]) {
  const unified = unifyStyle(styles)
  let omitted: Partial<{ [key in K]: any }> = {}
  for (const style of unified) {
    for (const key of keys) {
      if (key in style) {
        omitted[key] = style[key]
        delete style[key]
      }
    }
  }

  return {
    incl: unified,
    excl: [omitted]
  }
}
