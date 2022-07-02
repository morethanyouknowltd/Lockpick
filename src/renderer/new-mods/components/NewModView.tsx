import React from 'react'
import { Txt, Flex, Icon } from '@mtyk/frontend/core/components'
import useSelectedMod from '../hooks/useSelectedMod'
import { observer } from 'mobx-react-lite'
import NewModEditor from './NewModEditor'
import NewModShortcuts from './Shortcuts/NewModShortcuts'

export interface NewModViewProps {}

export default observer(function NewModView(props: NewModViewProps) {
  const {} = props
  const selectedMod = useSelectedMod()
  if (!selectedMod) {
    return null
  }

  return (
    <Flex row stretch style={{ height: '100vh' }} grow={1}>
      <NewModEditor />
      <NewModShortcuts />
    </Flex>
  )
})
