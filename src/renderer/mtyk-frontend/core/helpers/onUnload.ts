let w = typeof window === 'undefined' ? {} : (window as any)
w.onUnloaders = w.onUnloaders || []

w.onbeforeunload = e => {
  for (const unloader of w.onUnloaders) {
    if (unloader.fn()) {
      // console.log('there was an unloader')
      e.preventDefault()
      return false
    }
  }
}
let nextId = 0

export default function onUnload(fn: Function) {
  const thisId = ++nextId
  w.onUnloaders.push({ fn, id: thisId })
  return () => {
    w.onUnloaders.splice(
      w.onUnloaders.findIndex(e => e.id === thisId),
      1
    )
  }
}
