import React from 'react'
import styled from 'styled-components'

const Wrap = styled.div`
  display: flex;
  position: absolute;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
`
const Center = styled.div`
  background: #222;
  font-size: 1.2em;
  border-radius: 0.3em;
  padding: 0.3em 0.8em;
`

export const PluginWindowWrap = props => {
  const { content } = props
  return (
    <Wrap>
      <Center>{content}</Center>
    </Wrap>
  )
}
