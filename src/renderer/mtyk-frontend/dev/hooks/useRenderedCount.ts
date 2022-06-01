import React, { useRef } from 'react'

export default function useRenderedCount() {
  const renderedCount = useRef(0)
  return ++renderedCount.current
}
