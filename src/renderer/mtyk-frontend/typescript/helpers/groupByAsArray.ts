import _ from 'lodash'

export default function groupByAsArray<T extends any, K extends string>(
  items: T[],
  grouper: (item: T) => K
): { group: K; items: T[] }[] {
  return _(items)
    .groupBy(grouper)
    .mapValues((value, key) => {
      return { group: key as K, items: value }
    })
    .values()
    .value()
}
