import { Txt } from 'mtyk-frontend/core/components'
import React from 'react'
import useRenderedCount from '../hooks/useRenderedCount'

interface RenderedCountProps {}

export default function RenderedCount(props: RenderedCountProps) {
  const count = useRenderedCount()
  return (
    <Txt {...props} style={{ ...props.style }}>
      {count}
    </Txt>
  )
}
