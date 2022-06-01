import React from 'react'
import styled from 'styled-components'

const FlexWrap = styled.div`
  display: flex;
`
export const FlexGrow = styled.div`
  flex-grow: 1;
`

export const Flex = ({ children, ...rest }) => {
  return <FlexWrap style={rest}>{children}</FlexWrap>
}
