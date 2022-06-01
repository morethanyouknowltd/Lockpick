import styled from 'styled-components'

export const SettingsIcon = styled.div`
  font-size: 1.1em;
  color: #777;
  border: 1px solid transparent;
  padding: 0.4em;
  &:hover {
    /* color: #fff; */
    border-color: #222;
    background: #444;
  }
  &:active {
    background: #222;
  }
  border-radius: 0.5em;
  cursor: pointer;

  margin-right: 2rem;
`

export const Footer = styled.div`
  display: flex;
  user-select: none;
  padding: 0 1.5rem;
  align-items: center;
  justify-content: space-between;
  background: #111;
  border-top: 1px solid black;
  -webkit-app-region: drag;
  font-size: 0.8em;
  height: 2.8rem;
  > * {
    -webkit-app-region: no-drag;
    /* margin-left: 1rem; */
  }
`

export const VersionInfoWrap = styled.div`
  display: flex;
  align-items: center;
  > * {
    margin-right: 1em;
  }
  button {
    font-size: 0.9em;
  }
`
