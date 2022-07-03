import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'

import { observer } from 'mobx-react-lite'
import { LockpickIcons } from '../../../core/components/LockpickIcons'
import ToggleButton from '../../../core/components/ToggleButton'
import { newModsState } from '../../state/NewModsState'

export interface ShortcutsHeaderProps {}
export interface ShortcutsHeaderRefHandle {}

export default compose(observer)(function ShortcutsHeader(props: ShortcutsHeaderProps) {
  const {} = props

  return (
    <Flex>
      <ToggleButton
        value={newModsState.codeViewOpen}
        onChange={value => (newModsState.codeViewOpen = value)}
        icon={LockpickIcons.code}
        description="Toggle Code View"
      />
    </Flex>
  )
})
