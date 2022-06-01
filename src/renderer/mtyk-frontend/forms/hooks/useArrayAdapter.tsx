import { useState } from 'react'

export default function useArrayAdapter<T>(defaultValue: T[]) {
  const [s, ss] = useState(defaultValue)
  const rett = {
    value: s,
    onChangeForIndex: (index: number) => newValue => {
      console.log(`About to change ${index} to ${newValue}`)
      ss(s.map((el, i) => (i === index ? newValue : el)))
    },
    onChange: eventOrValue => {
      if (eventOrValue?.target) {
        ss(eventOrValue?.target.value)
      } else {
        ss(eventOrValue)
      }
    },
    forIndex: (index: number) => {
      return {
        value: s[index],
        onChange: rett.onChangeForIndex(index),
      }
    },
  }
  return rett
}
