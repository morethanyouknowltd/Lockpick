import React from 'react'
import styled from 'styled-components'
import { getVolumeString } from '../../bitwig-api/tracks'
import { ClickableCanvas } from '../ClickableCanvas'

const TooltipWrap = styled.div`
  position: absolute;
  left: 108%;
  top: 33%;
  font-size: 0.9em;
  background: #444;
  border: 1px solid #ccc;
  white-space: nowrap;
  padding: 0.4em 0.5em;
  transform: translateY(-50%);
`
const Tooltip = ({ volume, ...rest }) => {
  return <TooltipWrap {...rest}>{volume}</TooltipWrap>
}
const VolumeLevel = styled.div`
  right: ${(props: any) => Math.ceil((1 - props.volume) * 100) + '%'};
  bottom: 0;
  left: 0;
  top: 0;
  background: #502e13;
  box-shadow: inset -1px 0 0 0 #402814, inset -2px 0 0 0 #ea6a10, inset -3px 0 0 0 #402814;
  position: absolute;
`
const triangleSize = 0.6
const Started = styled.div`
  right: ${(props: any) => Math.ceil((1 - props.volume) * 100) + '%'};
  width: ${triangleSize}em;
  height: ${triangleSize}em;
  top: -${triangleSize / 2}em;
  transform: translateX(50%) rotate(45deg);
  background: #777;
  position: absolute;
`
const VolumeWrap = styled.div`
  position: relative;
  border: 1px solid #222;
  border-radius: 0.2em;
  background: #222;
  overflow: hidden;
  height: 5em;
  width: 185px;
`
const Container = styled.div`
  position: fixed;
  /* padding: .2em; */
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  border-radius: 0.2em;
  align-items: flex-start;
  justify-content: flex-start;
  top: ${(props: any) => props.top}px;
  left: ${(props: any) => props.left}px;
`
const Color = styled.div`
  width: 1em;
  height: 1em;
  background: ${(props: any) => props.color};
  font-size: 0.6em;
  margin-right: 0.5rem;
  border-radius: 1000px;
  border: 1px solid rgba(0, 0, 0, 0.33);
`
const Name = styled.div`
  max-width: 9em;
  font-size: 0.9em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const TrackInfo = styled.div`
  font-size: 1.1em;
  display: flex;
  padding: 0.3em 0;
  align-items: center;
  justify-content: center;
`

export const TrackVolumePopup = props => {
  const { track, mouse, volumeStartedAt } = props
  const containerProps = {
    left: Math.max(0, mouse.x - 125),
    top: mouse.y,
  }
  const diff =
    parseFloat(getVolumeString(track.volume), 10) - parseFloat(getVolumeString(volumeStartedAt), 10)
  const diffString = ' (' + ((diff > 0 ? '+' : '') + diff.toFixed(1)) + ' dB)'
  return (
    <Container {...containerProps}>
      <VolumeWrap>
        <VolumeLevel volume={track.volume} />
        {track.volume !== volumeStartedAt ? <Started volume={volumeStartedAt} /> : null}
      </VolumeWrap>
      <Tooltip volume={getVolumeString(track.volume) + (diff !== 0 ? diffString : '')} />
      <TrackInfo>
        <Color color={track.color} />
        <Name>{track.name}</Name>
        {/* {mouse.x} */}
        {/* {JSON.stringify(props)} */}
      </TrackInfo>
    </Container>
  )
}
