import React from 'react'
import styled from from 'styled-components'

const Style = styled.input`
  background: transparent;
  border: 1px solid #777;
  -webkit-appearance: none;
  &:checked {
    background: #ea6a10;
    border-color: #ea6a10;
  }
  width: 0.5em;
  height: 0.5em;
  &:focus {
    outline: none;
  }
  cursor: pointer;
`

export const Checkbox = props => {
  return <Style type="checkbox" {...props} />
}
