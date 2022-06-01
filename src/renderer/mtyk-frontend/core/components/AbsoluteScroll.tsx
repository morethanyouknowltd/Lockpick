import Flex from './Flex'
import { absoluteFill } from '../../styles/helpers/styleObjects'
import React, { forwardRef } from 'react'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'

function AbsoluteScroll({ children, style, ...rest }: DefaultNativeProps, ref) {
  return (
    <Flex
      style={{
        ...absoluteFill(),
        overflowY: 'auto',
        height: '100%',
        ...style,
      }}
      {...rest}
      ref={ref}>
      {children}
    </Flex>
  )
}

export default forwardRef(AbsoluteScroll)
