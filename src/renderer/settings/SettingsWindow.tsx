import Flex from '@mtyk/frontend/core/components/Flex'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import React, { useEffect } from 'react'
import getKorusState, { createRootState } from '../new-ui/helpers/korusState'

const SettingsInner = observer(() => {
  const state = getKorusState()
  return (
    <Flex style={{ backgroundColor: '#444' }}>
      {state.mods.mods.map(mod => {
        return <div key={mod.id}>{mod.name}</div>
      })}
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
