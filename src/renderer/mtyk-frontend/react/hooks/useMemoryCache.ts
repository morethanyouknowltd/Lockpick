import { isString } from 'lodash'
import { useState } from 'react'

let cache: { [key: string]: any } = {}

/**
 * @param uniqueKey if doesn't exist in the cache, will reset the value for `key`
 */
export default function useMemoryCache<T = any>(
  key: string,
  defaultValue: T,
  uniqueKey?: string
) {
  if (isString(uniqueKey) && !cache[uniqueKey]) {
    delete cache[key]
    cache[uniqueKey] = true
  }

  cache[key] = cache[key] ?? defaultValue

  // We only really use this to trigger rerender
  const [refreshTrigger, setRefreshTrigger] = useState({})
  return [
    cache[key],
    (val: T, skipReact: boolean = false) => {
      cache[key] = val
      if (!skipReact) {
        setRefreshTrigger({})
      }
    },
    {
      update: (update: any, skipReact: boolean = false) => {
        Object.assign(cache[key], update)
        if (!skipReact) {
          setRefreshTrigger({})
        }
      },
    },
  ]
}
