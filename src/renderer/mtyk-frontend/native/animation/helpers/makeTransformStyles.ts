export default function makeTransformStyles(_styleMap: any) {
  const styleMap = { ..._styleMap }
  const addTransformEl = (type, val) => {
    styleMap.transform = [
      ...(styleMap.transform ?? []),
      {
        [type]: val,
      },
    ]
  }
  for (const key of [
    'scale',
    'translateX',
    'translateY',
    'translateZ',
    'scaleX',
    'scaleY',
    'scaleZ',
  ]) {
    if (key in styleMap) {
      addTransformEl(key, styleMap[key])
      delete styleMap[key]
    }
  }
  return styleMap
}
