import { useContext, useEffect, useRef } from 'react'
import type { DevAction } from '../contexts/DevContext';
import DevContext from '../contexts/DevContext'
import { isObjectLike } from 'lodash'
let id = 0
import { config } from '../../core/helpers/config'
type ProvidedAction = Omit<DevAction, 'componentId'>

export default function useDevProvider(actions?: ProvidedAction[]) {
  const context = useContext(DevContext)

  if (
    !isObjectLike(context) ||
    typeof context.provideActions !== 'function' ||
    config.environment !== 'development'
  ) {
    return {
      provideActions: () => {},
    }
  }

  const thisId = useRef(++id)
  const mapAction = (action: ProvidedAction) => {
    return {
      ...action,
      componentId: thisId.current,
    }
  }
  useEffect(() => {
    if (actions) {
      context.provideActions(actions.map(mapAction))
    }
    return () => {
      context.removeActions(thisId.current)
    }
  }, [])

  const api = {
    provideActions: (actions: ProvidedAction[]) => {
      context.provideActions(actions.map(mapAction))
    },
  }

  return api
}
