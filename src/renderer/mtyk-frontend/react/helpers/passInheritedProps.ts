import unifyStyle, { unifyStyles } from "./unifyStyle"

export default function passInheritedProps(props: any, { style }: { style?: any } = {}) {
  let out: { style?: any } = {}
  if (props.style) {
    out.style = unifyStyles([...unifyStyles(style), ...unifyStyles(props.style)])
  }
  return out
}
