import Flex from '@mtyk/frontend/core/components/Flex'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import React, { useEffect } from 'react'
import getKorusState, { createRootState } from '../new-ui/helpers/korusState'
import Sidebar from '../new-ui/components/sidebar/Sidebar'
import NewModView from '../new-mods/components/NewModView'

const SettingsInner = observer(() => {
  const state = getKorusState()
  return (
    <Flex row stretch style={{ backgroundColor: '#444' }}>
      <Sidebar />
      <NewModView />
    </Flex>
  )
})

export const SettingsWindow = () => {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    createRootState(() => setReady(true))
  }, [])

  return ready ? <SettingsInner /> : <div>Loading...</div>
}
