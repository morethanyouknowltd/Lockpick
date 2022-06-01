import React from 'react'

type AutoMappable = { id: string } | { _id: string } | { key: string }

export default function autoMap<
  T extends AutoMappable,
  R extends React.ReactElement
>(arr: T[], cb: (item: T, index: number, arr: T[]) => R): any[] {
  return arr.map((item, i, arr) => {
    return React.cloneElement(cb(item, i, arr), {
      key: item.id || item._id || item.key,
    })
  })
}

export function iMap<T, R extends React.ReactElement>(
  arr: T[],
  cb: (item: T, index: number, arr: T[]) => R
): any[] {
  return arr.map((item, i, arr) => {
    return React.cloneElement(cb(item, i, arr), {
      key: i,
    })
  })
}
