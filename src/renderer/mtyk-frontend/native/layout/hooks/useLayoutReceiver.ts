import React, { useState } from 'react'

export default function useLayoutReceiver(hasDefault?: boolean) {
  const [layout, set] = useState(
    hasDefault ? { x: 0, y: 0, width: 0, height: 0 } : undefined
  )
  return {
    onLayout: ({ nativeEvent }) => {
      set(nativeEvent.layout)
    },
    layout,
  }
}
