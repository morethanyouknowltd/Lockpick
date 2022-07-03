import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import styled from from 'styled-components'
const WarningIcon = styled.div`
  background: #ecec58;
  border-radius: 1000px;
  height: 1.6em;
  color: #606029;
  width: 1.6em;
  font-size: 0.7em;
  border: 1px solid #606029;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

export const Warning = ({ title }) => {
  return (
    <WarningIcon title={title}>
      <FontAwesomeIcon icon={faExclamation} />
    </WarningIcon>
  )
}
