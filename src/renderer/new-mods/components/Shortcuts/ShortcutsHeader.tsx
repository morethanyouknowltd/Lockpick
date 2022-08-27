import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'

import { observer } from 'mobx-react-lite'
import useSelectedMod from '../../../new-mods/hooks/useSelectedMod'
import { LockpickIcons } from '../../../core/components/LockpickIcons'
import ToggleButton from '../../../core/components/ToggleButton'
import { newModsState } from '../../state/NewModsState'

export interface ShortcutsHeaderProps {}
export interface ShortcutsHeaderRefHandle {}

export default compose(observer)(function ShortcutsHeader(props: ShortcutsHeaderProps) {
  const {} = props
  const selectedMod = useSelectedMod()
  return (
    <Flex between row>
      <Txt medium>{selectedMod.name}</Txt>
      <ToggleButton
        value={newModsState.codeViewOpen}
        onChange={value => (newModsState.codeViewOpen = value)}
        icon={LockpickIcons.code}
        description="Toggle Code View"
      />
    </Flex>
  )
})
