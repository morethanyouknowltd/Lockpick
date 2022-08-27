import { Flex } from '@mtyk/frontend/core/components'
import { observer } from 'mobx-react-lite'
import compose from '@mtyk/frontend/react/helpers/compose'
import useSelectedMod from '../hooks/useSelectedMod'
import NewModEditor from './NewModEditor'
import NewModShortcuts from './Shortcuts/NewModShortcuts'
import { newModsState } from '../state/NewModsState'

export interface NewModViewProps {}

export default compose(observer)(function NewModView(props: NewModViewProps) {
  const {} = props
  const selectedMod = useSelectedMod()
  if (!selectedMod) {
    return null
  }

  return (
    <Flex row stretch style={{ height: '100vh', overflow: 'hidden' }} grow={1}>
      {newModsState.codeViewOpen ? <NewModEditor /> : null}
      <NewModShortcuts />
    </Flex>
  )
})
