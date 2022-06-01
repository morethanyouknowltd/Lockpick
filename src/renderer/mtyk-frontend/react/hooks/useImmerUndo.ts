import { applyPatches, enablePatches, freeze, produceWithPatches } from 'immer'
import { last } from 'lodash'
import { useRef, useState } from 'react'
enablePatches()

export default function useImmerUndo<T>(initialValue: T) {
  const [value, setValue] = useState(
    freeze(
      typeof initialValue === 'function' ? initialValue() : initialValue,
      true
    )
  )

  const historyRef = useRef({ history: [], index: -1 })
  let { history, index } = historyRef.current

  const updateValue = (updater: any) => {
    //users will be user state defined above
    const [nextState, patches, inversePatches] = produceWithPatches(
      value,
      updater
    )

    const { current } = historyRef

    if (inversePatches.length) {
      const lastInversePatch = last(current.history)?.inversePatches[0]
      if (
        lastInversePatch &&
        lastInversePatch.path.join('') === inversePatches[0].path.join('') &&
        typeof lastInversePatch.value === 'string'
      ) {
        // Merge with last item, just changed a string
        current.history[current.history.length - 1] = {
          inversePatches: [lastInversePatch],
          patches,
        }
        setValue(nextState)
        return
      }
    }
    current.history = history.slice(0, index + 1)
    if (inversePatches.length) {
      current.history.push({ inversePatches, patches })
      current.index++
      // Make sure history doesn't exceed max items
      while (current.history.length > 10) {
        current.history.splice(0, 1)
        current.index--
      }
    }

    setValue(nextState)
  }

  type Direction = 'back' | 'forward'
  const canGoBackForward = (dir: Direction) => {
    return dir === 'back' ? index > 0 : index < history.length - 1
  }

  const backForward = (dir: Direction) => {
    const isUndo = dir === 'back'
    if (!canGoBackForward(dir)) {
      return
    }
    const { current } = historyRef
    current.index += isUndo ? -1 : 1
    const patches = isUndo
      ? current.history[current.index + 1].inversePatches
      : current.history[current.index].patches
    setValue(applyPatches(value, patches))
  }
  return {
    value,
    updateValue,
    canUndo: canGoBackForward('back'),
    canRedo: canGoBackForward('forward'),
    undo: () => backForward('back'),
    redo: () => backForward('forward'),
  }
}
