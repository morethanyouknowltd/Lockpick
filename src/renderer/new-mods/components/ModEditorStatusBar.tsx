import React from 'react'
import { Txt, Flex, Icon } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import useSelectedMod from '../hooks/useSelectedMod'

export interface ModEditorStatusBarProps {}
export interface ModEditorStatusBarRefHandle {}

export default compose()(function ModEditorStatusBar(props: ModEditorStatusBarProps) {
  const {} = props

  const selectedMod = useSelectedMod()
  if (!selectedMod) {
    return null
  }
  return <Flex>{selectedMod.loading ? <Txt>Loading...</Txt> : null}</Flex>
})
