import React from 'react'
import styled from from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ButtonStyle = styled.button`
  -webkit-appearance: none;
  background: ${(props: any) => (props.secondary ? `#232323` : `#473f89`)};
  color: white;
  font-size: 0.9em;
  padding: 0.5em 2em;
  border: 1px solid ${props => (props.secondary ? `#111` : `#200f40`)};
  &:active {
    background: ${props => (props.secondary ? `#111` : `#200f40`)};
  }
  margin: 0 auto;
  display: block;
  cursor: pointer;
  outline: none !important;
  &:disabled {
    cursor: not-allowed;
    background: #666;
    opacity: 0.5;
  }
  &:hover:not(:disabled) {
    filter: brightness(85%);
  }
  svg {
    font-size: 0.8em;
    margin-right: 0.6em;
  }
  border-radius: 0.2em;
`
export const Button = ({
  icon,
  children,
  link,
  ...rest
}: { link?: string; children: any } & any) => {
  if (link) {
    return (
      <a href={link}>
        <ButtonStyle {...rest}>{children}</ButtonStyle>
      </a>
    )
  }
  return (
    <ButtonStyle {...rest}>
      {icon ? <FontAwesomeIcon icon={icon} /> : null}
      {children}
    </ButtonStyle>
  )
}
