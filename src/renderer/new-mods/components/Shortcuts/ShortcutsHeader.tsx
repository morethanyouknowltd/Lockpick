import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'

import { observer } from 'mobx-react-lite'
import useSelectedMod from '../../../new-mods/hooks/useSelectedMod'
import { LockpickIcons } from '../../../core/components/LockpickIcons'
import ToggleButton from '../../../core/components/ToggleButton'
import { newModsState } from '../../state/NewModsState'
import Panel from 'renderer/new-ui/components/Panel'

export interface ShortcutsHeaderProps {}
export interface ShortcutsHeaderRefHandle {}

export default compose(observer)(function ShortcutsHeader(props: ShortcutsHeaderProps) {
  const {} = props
  const selectedMod = useSelectedMod()
  return (
    <Panel style={{ borderBottom: '1px solid #333' }}>
      <Flex between row>
        <Flex gap=".8em">
          <Txt medium>{selectedMod.name}</Txt>
          <Txt>{selectedMod.description}</Txt>
        </Flex>
        <Flex rowCenter shrink={0} gap="1em">
          <ToggleButton
            value={newModsState.codeViewOpen}
            onChange={value => (newModsState.codeViewOpen = value)}
            icon={LockpickIcons.code}
            description="Toggle Code View"
          />
          <ToggleButton
            value={newModsState.modTab === 'settings'}
            onChange={value => (newModsState.modTab === 'settings' ? 'shortcuts' : 'settings')}
            icon={LockpickIcons.settings}
            description="Mod Settings"
          />
        </Flex>
      </Flex>
    </Panel>
  )
})
