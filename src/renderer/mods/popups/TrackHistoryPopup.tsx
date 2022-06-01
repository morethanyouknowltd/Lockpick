import React from 'react'
import styled from 'styled-components'
import { Centered } from '../Centered'

const Wrap = styled.div`
  background: #222;
  border-radius: 0.3em;
  overflow: hidden;
`

const TrackWrap = styled.div`
  padding: 0.5em 1em;
  background: ${(props: any) => (props.isSelected ? `#CCC` : ``)};
  color: ${(props: any) => (props.isSelected ? `black` : ``)};
  border-bottom: 0.3em solid ${(props: any) => props.color};
`

const Header = styled.div`
  padding: 0.5em 0.1em;
  text-align: center;
  font-size: 0.9em;
  background: #222;
`

const TracksWrap = styled.div`
  display: flex;
`

export const TrackHistoryPopup = props => {
  const { history, index } = props
  return (
    <Centered>
      <Wrap>
        <Header>Track History</Header>
        <TracksWrap>
          {history.map((track, i) => {
            return (
              <TrackWrap key={track.name + i} isSelected={index === i} color={track.color}>
                {track.name}
              </TrackWrap>
            )
          })}
        </TracksWrap>
      </Wrap>
    </Centered>
  )
}
