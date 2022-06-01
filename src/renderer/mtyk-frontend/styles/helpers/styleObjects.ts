export function allCorners<T>(val: T) {
  return {
    top: val,
    bottom: val,
    left: val,
    right: val,
  }
}
export function absoluteFill() {
  return {
    position: 'absolute' as 'absolute', // Fixes weird type error, string !== absolute? dumb
    ...allCorners(0),
  }
}

export function makeSize(s: number | string) {
  return {
    width: s,
    height: s,
  }
}

export function lineClamp(lines: number = 1) {
  return {
    WebkitLineClamp: lines,
    lineBreak: 'anywhere',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box',
    overflow: 'hidden',
  }
}

export function circle(s: number | string) {
  return {
    borderRadius: s,
    width: s,
    flexShrink: 0,

    height: s,
  }
}
export function absoluteCenter() {
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
  }
}

export default function absoluteCenterY() {
  return {
    position: 'absolute',
    top: '50%',
    transform: `translateY(-50%)`,
  }
}

export function borderTop(width: number, color: string) {
  return {
    borderTopColor: color,
    borderTopWidth: width,
  }
}

export function border(
  width: number,
  color: string,
  style: 'solid' | 'dashed' | 'dotted' = 'solid'
) {
  return {
    borderColor: color,
    borderWidth: width,
    borderStyle: style,
  }
}

export function combineStyles(...styles: any[]) {
  return styles.reduce((prev, curr) => ({ ...prev, ...curr }), {})
}
