import { mixColor } from 'react-native-redash'

export const interp = (val: any) => (min: any, max: any) => {
  return val.interpolate({
    inputRange: [0, 1],
    outputRange: [min, max],
  })
}

export function clamp(val: number, min: number = 0, max: number = 1) {
  'worklet'
  return Math.min(max, Math.max(val, min))
}

export function rInterp(delta: any, min: any, max: any, percent = false) {
  'worklet'
  if (typeof min === 'string') {
    if (min.indexOf('%') === -1) {
      // hopefully it's a color
      const mixed = mixColor(delta, min, max)
      const transparencies = [min, max].map((c) =>
        c.startsWith('rgba')
          ? parseFloat(c.split(',')[3])
          : c.startsWith('#') && c.length > 7
          ? parseInt(c.substr(-2), 16) / 255
          : 1
      )
      //
      const toRet =
        '#' +
        (mixed & 0x00ffffff).toString(16).padStart(6, '0') +
        Math.round(rInterp(delta, transparencies[0], transparencies[1]) * 255)
          .toString(16)
          .padStart(2, '0')
      if (toRet === '#000000ff') {
        // quick fix for when interpolate somehow ends up black???
        return 'transparent'
      }
      return toRet
    }
    min = parseInt(min, 10)
    max = parseInt(max, 10)
    percent = true
  }
  const range = max - min
  return min + range * delta + (percent ? '%' : 0)
}

export function rInterpObject(from: any, to: any, delta: any) {
  'worklet'
  let out: any = {}
  for (const key in from) {
    const val = from[key]
    if (typeof val === 'object') {
      // nested value
      if (Array.isArray(val)) {
        out[key] = val.map((obj, i) => rInterpObject(obj, to[key][i], delta))
      } else {
        out[key] = rInterpObject(val, to[key], delta)
      }
    } else {
      out[key] = rInterp(delta, val, to[key])
    }
  }
  return out
}
