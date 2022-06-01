import { useEffect, useRef } from 'react'
import Router, { useHistory } from '../../core/hooks/routerHooks'

export default function useLocationHalt(isDirty: () => boolean) {
  const message = 'Are you sure you want to discard any unsaved changes?'

  const router = useHistory()
  const lastHistoryState = useRef(global.history?.state)
  useEffect(() => {
    const storeLastHistoryState = () => {
      lastHistoryState.current = history.state
    }
    Router.events.on('routeChangeComplete', storeLastHistoryState)
    return () => {
      Router.events.off('routeChangeComplete', storeLastHistoryState)
    }
  }, [])

  useEffect(() => {
    let isWarned = false

    const routeChangeStart = (url: string) => {
      if (Router.asPath !== url && isDirty() && !isWarned) {
        isWarned = true
        if (window.confirm(message)) {
          router.push(url)
        } else {
          isWarned = false
          Router.events.emit('routeChangeError')

          // HACK
          const state = lastHistoryState.current
          if (
            state != null &&
            history.state != null &&
            state.idx !== history.state.idx
          ) {
            history.go(state.idx < history.state.idx ? -1 : 1)
          }

          // eslint-disable-next-line no-throw-literal
          throw 'Abort route change. Please ignore this error.'
        }
      }
    }

    const beforeUnload = (e: any) => {
      if (isDirty() && !isWarned) {
        const event = e || window.event
        event.returnValue = message
        return message
      }
      return null
    }

    Router.events.on('routeChangeStart', routeChangeStart)
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      Router.events.off('routeChangeStart', routeChangeStart)
      window.removeEventListener('beforeunload', beforeUnload)
    }
  }, [message, isDirty()])
}
