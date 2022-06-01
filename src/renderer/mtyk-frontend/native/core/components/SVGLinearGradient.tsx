import React from 'react'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'
import { unifyStyles } from '../../../react/helpers/unifyStyle'
export default function SVGLinearGradient({
  stops,
  style,
}: {
  style?: any
  stops: {
    stopOpacity?: number
    stopColor: string
    offset?: string
  }[]
}) {
  return (
    <Svg
      style={[
        {
          width: '100%',
          height: '100%',
        },
        ...unifyStyles(style),
      ]}
    >
      <Defs>
        <LinearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          {stops.map((_stop, i) => {
            const stop = {
              stopOpacity: 1,
              offset: i === 0 ? '0%' : '100%',
              ..._stop,
            }
            return <Stop key={i} {...stop} />
          })}
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grad2)" />
    </Svg>
  )
}
