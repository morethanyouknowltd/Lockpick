import { useEffect, useState } from 'react'
import { RootSiblingParent } from 'react-native-root-siblings'
import { createRootState } from '../../../new-ui/helpers/korusState'

export default function AppWrap({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    createRootState(state => {
      setReady(true)
    })
  }, [])

  return ready ? <RootSiblingParent>{children}</RootSiblingParent> : null
}
