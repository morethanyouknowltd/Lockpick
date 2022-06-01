import React from 'react'
import styled from 'styled-components'

const ErrorWrap = styled.div`
  background: #431515;
  border-radius: 0.2em;
  padding: 1em 2em;
  margin-top: 1.7em;
  border: 2px solid #651e1e;

  p:nth-child(1) {
    margin-bottom: 1em;
    font-size: 0.9em;
  }
  p:nth-child(2) {
    text-align: center;
  }
  div {
    white-space: pre-wrap;
    text-align: left;
    font-family: Menlo, monospace;
    font-size: 0.9em;
  }
`

export const ModError = ({ mod }) => {
  return (
    <ErrorWrap>
      <p>There was an error loading {mod.name}:</p>
      <div>{mod.error.stack}</div>
    </ErrorWrap>
  )
}
