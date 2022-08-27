import styled from 'styled-components'

export const PlayButtonWrap = styled.div`
  opacity: 0;
  position: absolute;
  display: inline-flex;
  width: 1.1em;
  height: 1.1em;
  border-radius: 1000px;
  background: #444;
  color: white;
  transform: translate(-145%, 10%);
  > * {
    font-size: 0.4em;
  }
  &:active {
    background: #200f40;
  }
  &:hover:not(:disabled) {
    background: #473f89;
  }
  cursor: pointer;
  align-items: center;
  justify-content: center;
`
export const ActionTd = styled.td`
  &:hover {
    ${PlayButtonWrap} {
      opacity: 1;
    }
  }
`
export const ShortcutTableCell = styled.div`
  background: #101010;
  border-radius: 0.5em;
  display: flex;
  color: #8c8c8c;
  align-items: center;
  justify-content: center;
`
export const InfoPanelWrap = styled.div`
  font-size: 0.9em;
  width: 27em;
  height: 100%;

  overflow-y: auto;
  background: #121212;
  border-left: 1px solid black;
  > div:nth-child(1) {
    > div {
      padding: 2rem;
      > h1 {
        font-size: 1.1em;
        font-weight: 400;
        /* color: #a7a7a7; */
      }
      > p {
        margin-top: 2rem;
        /* color: #717171; */
      }
      > div {
        margin-top: 5.5rem;
        max-width: 11.9rem;
        margin: 2.5rem auto;
      }
    }
  }
`

export const TableWrap = styled.div<{ enabled: boolean }>`
  overflow-y: auto;
  flex-grow: 1;

  tbody tr {
    &:not(.nonrow) {
      cursor: pointer;
      &:hover {
        background: #181818;
      }
    }
    #quickset {
      color: #999;
      opacity: 0;
      white-space: nowrap;
      &:hover {
        opacity: 1;
      }
    }
  }
  th,
  td {
    padding: 0.3em 2rem;
    user-select: none;

    &:not(:last-child) {
      /* border-right: 1px solid #111; */
    }
  }
  th {
    text-align: left;
    font-weight: 400;
    padding-top: 0.9em;
    padding-bottom: 1em;
    color: #5b5b5b;
  }
  td {
    opacity: ${(props: any) => (props.enabled ? '1' : '.2')};
    font-size: 1.05em;
    /* color: #ccc; */
    border-bottom: 1px solid #444;
    color: #b6b6b6;
    &:not(:first-child) {
      color: #555;
    }
  }
  table {
    width: 100%;
  }
  table,
  th,
  td {
    /* border: 1px solid black; */
    border-collapse: collapse;
  }
`
