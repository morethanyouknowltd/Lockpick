import Flex from '@mtyk/frontend/core/components/Flex'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import React, { useEffect } from 'react'
import getKorusState, { createRootState } from '../new-ui/helpers/korusState'
import SidebarModsList from '../new-ui/components/sidebar/SidebarModsList'
import { Txt } from '@mtyk/frontend/core/components'

const SettingsInner = observer(() => {
  const state = getKorusState()
  return (
    <Flex style={{ backgroundColor: '#444' }}>
      <SidebarModsList />
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
