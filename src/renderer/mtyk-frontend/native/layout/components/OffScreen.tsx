import React from 'react'
import { View } from 'react-native'
import useDimensions from '../../../styles/hooks/useDimensions'

function Offscreen({ children, onLayout }) {
  const { width } = useDimensions()
  return (
    <View
      onLayout={onLayout}
      style={{
        position: 'absolute',
        left: width,
      }}
    >
      {children}
    </View>
  )
}

export default Offscreen
