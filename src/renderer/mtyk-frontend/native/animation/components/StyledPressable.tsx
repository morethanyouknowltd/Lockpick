import makeTransformStyles from '../../../native/animation/helpers/makeTransformStyles'
import React, { useState } from 'react'
import { Pressable } from 'react-native'
import { unifyStyles } from '../../../react/helpers/unifyStyle'

function StyledPressable({ pressedStyle, unpressedStyle, ...rest }) {
  const [pressed, setPressed] = useState(false)
  const ourStyles = makeTransformStyles(pressed ? pressedStyle : unpressedStyle)
  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      {...rest}
      style={[...unifyStyles(rest.style), ourStyles]}
    />
  )
}

export default StyledPressable
