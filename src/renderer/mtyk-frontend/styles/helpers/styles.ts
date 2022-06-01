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

export function makeSize(s: number) {
  return {
    width: s,
    height: s,
  }
}

export function borderTop(width: number, color: string) {
  return {
    borderTopColor: color,
    borderTopWidth: width,
  }
}
export function borderBottom(width: number, color: string) {
  return {
    borderBottomColor: color,
    borderBottomWidth: width,
  }
}

export function border(width: number, color: string) {
  return {
    borderColor: color,
    borderWidth: width,
  }
}

export function shadow(
  x = 0,
  y = 2,
  radius = 5,
  opacity = 0.07,
  color = 'black'
) {
  return {
    shadowRadius: radius,
    shadowOpacity: opacity,
    shadowOffset: {
      width: x,
      height: y,
    },
    shadowColor: color,
  }
}

// export function ss(styles) {
//     let out = []
// }
