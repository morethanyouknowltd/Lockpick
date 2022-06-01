import { useState } from 'react'

export default function useInputAdapter<T>(defaultValue: T) {
  const [s, ss] = useState(defaultValue)
  return {
    value: s,
    onChange: (eventOrValue) => {
      if (eventOrValue?.target) {
        ss(eventOrValue?.target.value)
      } else {
        ss(eventOrValue)
      }
    },
    onChangeText: (text) => {
      ss(text)
    },
  }
}
