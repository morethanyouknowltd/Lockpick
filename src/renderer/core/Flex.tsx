import React from 'react'
import styled from from 'styled-components'

const FlexWrap = styled.div`
  display: flex;
`
export const FlexGrow = styled.div`
  flex-grow: 1;
`

/**
 * @deprecated
 */
export const Flex = ({ children, ...rest }) => {
  return <FlexWrap style={rest}>{children}</FlexWrap>
}
