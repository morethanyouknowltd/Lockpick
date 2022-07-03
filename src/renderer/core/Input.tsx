import React from 'react'
import styled from from 'styled-components'

const Style = styled.input`
  border: 1px solid #131313;
  border-radius: 0.6em;
  -webkit-appearance: none;
  padding: 0.5em 1em;
  background: #1b1b1b;
  color: #7b7b7b;
  display: block;
  font-size: 0.9em;
  width: 100%;
  &:focus {
    /* background: #EA6A10; */
    border-color: #444;
  }
  /* width: .8em; */
  /* height: .8em; */
  display: block;
  &:focus {
    outline: none;
  }
`

export const Input = props => {
  return <Style {...props} />
}
