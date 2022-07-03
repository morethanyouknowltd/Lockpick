import React from 'react'
import styled from from 'styled-components'

const TooltipWrap = styled.div`
  position: fixed;
  font-size: 0.86em;
  background: #222;
  border: 1px solid #ccc;
  white-space: nowrap;
  padding: 0.3em 0.7em;
  opacity: 0.9;
  transform: translateX(-120%);
`
const Guide = styled.div`
  position: fixed;
  opacity: 0.6;
  background: #888;
  height: 3px;
`

const levelsMap500 = [
  '-inf dB',
  '-inf dB',
  '-156 dB',
  '-138 dB',
  '-127 dB',
  '-120 dB',
  '-114 dB',
  '-109 dB',
  '-105 dB',
  '-102 dB',
  '-98.7 dB',
  '-95.9 dB',
  '-93.4 dB',
  '-91.2 dB',
  '-89.1 dB',
  '-87.1 dB',
  '-85.4 dB',
  '-83.7 dB',
  '-82.1 dB',
  '-80.6 dB',
  '-79.2 dB',
  '-77.9 dB',
  '-76.6 dB',
  '-75.4 dB',
  '-74.2 dB',
  '-73.1 dB',
  '-72.0 dB',
  '-71.0 dB',
  '-70.0 dB',
  '-69.1 dB',
  '-68.2 dB',
  '-67.3 dB',
  '-66.4 dB',
  '-65.6 dB',
  '-64.8 dB',
  '-64.0 dB',
  '-63.3 dB',
  '-62.5 dB',
  '-61.8 dB',
  '-61.1 dB',
  '-60.5 dB',
  '-59.8 dB',
  '-59.2 dB',
  '-58.5 dB',
  '-57.9 dB',
  '-57.3 dB',
  '-56.7 dB',
  '-56.2 dB',
  '-55.6 dB',
  '-55.0 dB',
  '-54.5 dB',
  '-54.0 dB',
  '-53.5 dB',
  '-53.0 dB',
  '-52.5 dB',
  '-52.0 dB',
  '-51.5 dB',
  '-51.0 dB',
  '-50.6 dB',
  '-50.1 dB',
  '-49.7 dB',
  '-49.2 dB',
  '-48.8 dB',
  '-48.4 dB',
  '-48.0 dB',
  '-47.5 dB',
  '-47.1 dB',
  '-46.7 dB',
  '-46.4 dB',
  '-46.0 dB',
  '-45.6 dB',
  '-45.2 dB',
  '-44.8 dB',
  '-44.5 dB',
  '-44.1 dB',
  '-43.8 dB',
  '-43.4 dB',
  '-43.1 dB',
  '-42.7 dB',
  '-42.4 dB',
  '-42.1 dB',
  '-41.7 dB',
  '-41.4 dB',
  '-41.1 dB',
  '-40.8 dB',
  '-40.5 dB',
  '-40.2 dB',
  '-39.8 dB',
  '-39.5 dB',
  '-39.2 dB',
  '-39.0 dB',
  '-38.7 dB',
  '-38.4 dB',
  '-38.1 dB',
  '-37.8 dB',
  '-37.5 dB',
  '-37.3 dB',
  '-37.0 dB',
  '-36.7 dB',
  '-36.4 dB',
  '-36.2 dB',
  '-35.9 dB',
  '-35.7 dB',
  '-35.4 dB',
  '-35.1 dB',
  '-34.9 dB',
  '-34.6 dB',
  '-34.4 dB',
  '-34.2 dB',
  '-33.9 dB',
  '-33.7 dB',
  '-33.4 dB',
  '-33.2 dB',
  '-33.0 dB',
  '-32.7 dB',
  '-32.5 dB',
  '-32.3 dB',
  '-32.1 dB',
  '-31.8 dB',
  '-31.6 dB',
  '-31.4 dB',
  '-31.2 dB',
  '-31.0 dB',
  '-30.7 dB',
  '-30.5 dB',
  '-30.3 dB',
  '-30.1 dB',
  '-29.9 dB',
  '-29.7 dB',
  '-29.5 dB',
  '-29.3 dB',
  '-29.1 dB',
  '-28.9 dB',
  '-28.7 dB',
  '-28.5 dB',
  '-28.3 dB',
  '-28.1 dB',
  '-27.9 dB',
  '-27.7 dB',
  '-27.5 dB',
  '-27.3 dB',
  '-27.1 dB',
  '-27.0 dB',
  '-26.8 dB',
  '-26.6 dB',
  '-26.4 dB',
  '-26.2 dB',
  '-26.1 dB',
  '-25.9 dB',
  '-25.7 dB',
  '-25.5 dB',
  '-25.4 dB',
  '-25.2 dB',
  '-25.0 dB',
  '-24.8 dB',
  '-24.7 dB',
  '-24.5 dB',
  '-24.3 dB',
  '-24.2 dB',
  '-24.0 dB',
  '-23.8 dB',
  '-23.7 dB',
  '-23.5 dB',
  '-23.3 dB',
  '-23.2 dB',
  '-23.0 dB',
  '-22.9 dB',
  '-22.7 dB',
  '-22.6 dB',
  '-22.4 dB',
  '-22.2 dB',
  '-22.1 dB',
  '-21.9 dB',
  '-21.8 dB',
  '-21.6 dB',
  '-21.5 dB',
  '-21.3 dB',
  '-21.2 dB',
  '-21.0 dB',
  '-20.9 dB',
  '-20.7 dB',
  '-20.6 dB',
  '-20.5 dB',
  '-20.3 dB',
  '-20.2 dB',
  '-20.0 dB',
  '-19.9 dB',
  '-19.7 dB',
  '-19.6 dB',
  '-19.5 dB',
  '-19.3 dB',
  '-19.2 dB',
  '-19.1 dB',
  '-18.9 dB',
  '-18.8 dB',
  '-18.6 dB',
  '-18.5 dB',
  '-18.4 dB',
  '-18.2 dB',
  '-18.1 dB',
  '-18.0 dB',
  '-17.9 dB',
  '-17.7 dB',
  '-17.6 dB',
  '-17.5 dB',
  '-17.3 dB',
  '-17.2 dB',
  '-17.1 dB',
  '-17.0 dB',
  '-16.8 dB',
  '-16.7 dB',
  '-16.6 dB',
  '-16.5 dB',
  '-16.3 dB',
  '-16.2 dB',
  '-16.1 dB',
  '-16.0 dB',
  '-15.9 dB',
  '-15.7 dB',
  '-15.6 dB',
  '-15.5 dB',
  '-15.4 dB',
  '-15.3 dB',
  '-15.1 dB',
  '-15.0 dB',
  '-14.9 dB',
  '-14.8 dB',
  '-14.7 dB',
  '-14.6 dB',
  '-14.4 dB',
  '-14.3 dB',
  '-14.2 dB',
  '-14.1 dB',
  '-14.0 dB',
  '-13.9 dB',
  '-13.8 dB',
  '-13.7 dB',
  '-13.5 dB',
  '-13.4 dB',
  '-13.3 dB',
  '-13.2 dB',
  '-13.1 dB',
  '-13.0 dB',
  '-12.9 dB',
  '-12.8 dB',
  '-12.7 dB',
  '-12.6 dB',
  '-12.5 dB',
  '-12.4 dB',
  '-12.3 dB',
  '-12.1 dB',
  '-12.0 dB',
  '-11.9 dB',
  '-11.8 dB',
  '-11.7 dB',
  '-11.6 dB',
  '-11.5 dB',
  '-11.4 dB',
  '-11.3 dB',
  '-11.2 dB',
  '-11.1 dB',
  '-11.0 dB',
  '-10.9 dB',
  '-10.8 dB',
  '-10.7 dB',
  '-10.6 dB',
  '-10.5 dB',
  '-10.4 dB',
  '-10.3 dB',
  '-10.2 dB',
  '-10.1 dB',
  '-10.0 dB',
  '-9.9 dB',
  '-9.8 dB',
  '-9.7 dB',
  '-9.7 dB',
  '-9.6 dB',
  '-9.5 dB',
  '-9.4 dB',
  '-9.3 dB',
  '-9.2 dB',
  '-9.1 dB',
  '-9.0 dB',
  '-8.9 dB',
  '-8.8 dB',
  '-8.7 dB',
  '-8.6 dB',
  '-8.5 dB',
  '-8.4 dB',
  '-8.4 dB',
  '-8.3 dB',
  '-8.2 dB',
  '-8.1 dB',
  '-8.0 dB',
  '-7.9 dB',
  '-7.8 dB',
  '-7.7 dB',
  '-7.6 dB',
  '-7.6 dB',
  '-7.5 dB',
  '-7.4 dB',
  '-7.3 dB',
  '-7.2 dB',
  '-7.1 dB',
  '-7.0 dB',
  '-6.9 dB',
  '-6.9 dB',
  '-6.8 dB',
  '-6.7 dB',
  '-6.6 dB',
  '-6.5 dB',
  '-6.4 dB',
  '-6.4 dB',
  '-6.3 dB',
  '-6.2 dB',
  '-6.1 dB',
  '-6.0 dB',
  '-5.9 dB',
  '-5.9 dB',
  '-5.8 dB',
  '-5.7 dB',
  '-5.6 dB',
  '-5.5 dB',
  '-5.4 dB',
  '-5.4 dB',
  '-5.3 dB',
  '-5.2 dB',
  '-5.1 dB',
  '-5.0 dB',
  '-5.0 dB',
  '-4.9 dB',
  '-4.8 dB',
  '-4.7 dB',
  '-4.6 dB',
  '-4.6 dB',
  '-4.5 dB',
  '-4.4 dB',
  '-4.3 dB',
  '-4.3 dB',
  '-4.2 dB',
  '-4.1 dB',
  '-4.0 dB',
  '-4.0 dB',
  '-3.9 dB',
  '-3.8 dB',
  '-3.7 dB',
  '-3.6 dB',
  '-3.6 dB',
  '-3.5 dB',
  '-3.4 dB',
  '-3.3 dB',
  '-3.3 dB',
  '-3.2 dB',
  '-3.1 dB',
  '-3.1 dB',
  '-3.0 dB',
  '-2.9 dB',
  '-2.8 dB',
  '-2.8 dB',
  '-2.7 dB',
  '-2.6 dB',
  '-2.5 dB',
  '-2.5 dB',
  '-2.4 dB',
  '-2.3 dB',
  '-2.3 dB',
  '-2.2 dB',
  '-2.1 dB',
  '-2.0 dB',
  '-2.0 dB',
  '-1.9 dB',
  '-1.8 dB',
  '-1.8 dB',
  '-1.7 dB',
  '-1.6 dB',
  '-1.5 dB',
  '-1.5 dB',
  '-1.4 dB',
  '-1.3 dB',
  '-1.3 dB',
  '-1.2 dB',
  '-1.1 dB',
  '-1.1 dB',
  '-1.0 dB',
  '-0.9 dB',
  '-0.9 dB',
  '-0.8 dB',
  '-0.7 dB',
  '-0.7 dB',
  '-0.6 dB',
  '-0.5 dB',
  '-0.5 dB',
  '-0.4 dB',
  '-0.3 dB',
  '-0.3 dB',
  '-0.2 dB',
  '-0.1 dB',
  '-0.1 dB',
  '+0.0 dB',
  '+0.1 dB',
  '+0.1 dB',
  '+0.2 dB',
  '+0.3 dB',
  '+0.3 dB',
  '+0.4 dB',
  '+0.5 dB',
  '+0.5 dB',
  '+0.6 dB',
  '+0.7 dB',
  '+0.7 dB',
  '+0.8 dB',
  '+0.8 dB',
  '+0.9 dB',
  '+1.0 dB',
  '+1.0 dB',
  '+1.1 dB',
  '+1.1 dB',
  '+1.2 dB',
  '+1.3 dB',
  '+1.4 dB',
  '+1.4 dB',
  '+1.5 dB',
  '+1.5 dB',
  '+1.6 dB',
  '+1.7 dB',
  '+1.7 dB',
  '+1.8 dB',
  '+1.8 dB',
  '+1.9 dB',
  '+2.0 dB',
  '+2.0 dB',
  '+2.1 dB',
  '+2.2 dB',
  '+2.2 dB',
  '+2.3 dB',
  '+2.3 dB',
  '+2.4 dB',
  '+2.5 dB',
  '+2.5 dB',
  '+2.6 dB',
  '+2.6 dB',
  '+2.7 dB',
  '+2.7 dB',
  '+2.8 dB',
  '+2.9 dB',
  '+2.9 dB',
  '+3.0 dB',
  '+3.0 dB',
  '+3.1 dB',
  '+3.2 dB',
  '+3.2 dB',
  '+3.3 dB',
  '+3.3 dB',
  '+3.4 dB',
  '+3.4 dB',
  '+3.5 dB',
  '+3.6 dB',
  '+3.6 dB',
  '+3.7 dB',
  '+3.7 dB',
  '+3.8 dB',
  '+3.8 dB',
  '+3.9 dB',
  '+4.0 dB',
  '+4.0 dB',
  '+4.1 dB',
  '+4.1 dB',
  '+4.2 dB',
  '+4.2 dB',
  '+4.3 dB',
  '+4.4 dB',
  '+4.4 dB',
  '+4.5 dB',
  '+4.5 dB',
  '+4.6 dB',
  '+4.6 dB',
  '+4.7 dB',
  '+4.7 dB',
  '+4.8 dB',
  '+4.8 dB',
  '+4.9 dB',
  '+5.0 dB',
  '+5.0 dB',
  '+5.1 dB',
  '+5.1 dB',
  '+5.2 dB',
  '+5.2 dB',
  '+5.3 dB',
  '+5.3 dB',
  '+5.4 dB',
  '+5.4 dB',
  '+5.5 dB',
  '+5.5 dB',
  '+5.6 dB',
  '+5.7 dB',
  '+5.7 dB',
  '+5.8 dB',
  '+5.8 dB',
  '+5.9 dB',
  '+5.9 dB',
  '+6.0 dB',
]

export const AutomationPopover = props => {
  const { track, mouse } = props
  const automationRect = track.automation.rect
  const yIn = mouse.y - automationRect.y
  const yRatio = yIn / automationRect.h
  const db = levelsMap500[Math.floor(levelsMap500.length - yRatio * levelsMap500.length)]
  if (!db) {
    return null
  }
  return (
    <>
      <TooltipWrap
        style={{
          top: `${mouse.y}px`,
          left: `${mouse.x}px`,
        }}>
        <span style={{ opacity: 0.5, paddingRight: '.5em' }}>
          {Math.round(100 - yRatio * 100)}%
        </span>
        {db}
      </TooltipWrap>
      <Guide
        style={{
          top: `${mouse.y}px`,
          left: `${track.rect.x + track.rect.w - 12}px`,
          right: `37px`,
        }}
      />
    </>
  )
}
