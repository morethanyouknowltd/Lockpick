import { ValOrCreator } from 'mtyk-frontend/typescript'
import React from 'react'
type MapType = { [key: string]: ValOrCreator<React.CSSProperties> | string }
// type ConvertedFromMap<Map extends MapType> = Map[keyof MapType]
type ConvertedFromMap<Map extends MapType> = any

/** @todo Fix types */
export default function makePropDeleter<M extends MapType>(
  map: M,
  shorthands: any = {}
) {
  for (const key in shorthands) {
    map[key] = map[shorthands[key]]
  }
  return function omitOwnPropsInPlace<P extends M>(
    props: P
  ): Partial<ConvertedFromMap<M>> {
    let transformed: any = {}
    const clonedProps = { ...props } as typeof props & {
      style?: React.CSSProperties
    }
    if (!('style' in clonedProps)) {
      clonedProps.style = {}
    }
    for (const key in map) {
      if (key in clonedProps) {
        const mapValue = map[key]
        if (typeof mapValue === 'string' || typeof mapValue === 'number') {
          transformed[mapValue] = clonedProps[key]
        } else if (typeof mapValue === 'function') {
          Object.assign(transformed, mapValue(clonedProps[key]))
        } else if (clonedProps[key]) {
          Object.assign(transformed, mapValue)
        }
        delete clonedProps[key]
      }
    }
    return { clonedProps, transformed }
  }
}
