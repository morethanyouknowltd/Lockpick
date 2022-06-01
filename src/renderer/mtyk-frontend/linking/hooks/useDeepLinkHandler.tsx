import { useEffect } from 'react'
import { useHistory } from '../../core/hooks/routerHooks'
import { config } from '../../core/helpers/config'

export default function useDeepLinkHandler() {
  const history = useHistory()
  // Listen for deep link urls
  if (config.isNative) {
    const { Linking } = require('react-native')
    useEffect(() => {
      const listener = ({ url }: { url: string }) => {
        // console.log('Got deep link', { url })
        const ourUrl = url.split(`/--`)[1]
        // console.log({ ourUrl })
        history.push(ourUrl)
      }

      Linking.getInitialURL()
        .then((url) => {
          if (url) {
            listener({ url })
          }
        })
        .catch((e) => console.error(e))

      Linking.addEventListener('url', listener)
      return () => {
        Linking.removeEventListener('url', listener)
      }
    }, [])
  }
}
