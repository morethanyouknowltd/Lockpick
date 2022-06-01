import { useCallback, useEffect, useRef, useState } from 'react'
import { useImmer } from 'use-immer'
import useMemoryCache from './useMemoryCache'

let listeners: { [key: string]: ((newval: any) => void)[] } = {}

export default function useMemoryImmer(
  key: string,
  defaultValue = {},
  uniqueKey?
) {
  // const [refreshState, setRefreshState] = useState(0)

  const [inMemory, updateInMemory] = useMemoryCache(
    key,
    defaultValue,
    uniqueKey
  )
  const [immerVal, updateImmerVal] = useImmer(inMemory)
  const ourListener = useCallback(newValue => {
    // setRefreshState(refreshState + 1)
    updateInMemory(newValue, true)
    updateImmerVal(newValue)
  }, [])

  useEffect(() => {
    if (!listeners[key]) {
      listeners[key] = []
    }
    listeners[key].push(ourListener)
    return () => {
      listeners[key] = listeners[key].filter(l => l === ourListener)
    }
  }, [ourListener])

  const update = newValue => {
    updateImmerVal(newValue)
  }

  useEffect(() => {
    updateInMemory(immerVal)
    // console.log(
    // `Immer value changed, updating ${listeners[key].length} listeners`
    // )
    for (const listener of listeners[key]) {
      if (listener !== ourListener) {
        listener(immerVal)
      }
    }
  }, [immerVal])

  return [immerVal, update]
}
