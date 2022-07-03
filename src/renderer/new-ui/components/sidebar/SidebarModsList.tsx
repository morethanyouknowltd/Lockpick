import { observer } from 'mobx-react-lite'
import { Flex, Txt } from '@mtyk/frontend/core/components'
import { Mod } from '../../../../connector/shared/state/models/Mod.model'
import SectionList from '../../../core/SectionList'
import getKorusState from '../../helpers/korusState'
import { newModsState } from '../../../new-mods/state/NewModsState'
import { useEffect } from 'react'

export interface SidebarModsListProps {}

const SidebarListItem = observer(function ItemComponent({ data }: { data: Mod }) {
  const state = getKorusState()
  const isModSelected = newModsState.mods.isItemSelected(data)
  const color = isModSelected ? '#E45AFF' : data.active ? '#ffffff' : '#666'
  return (
    <Txt
      color={color}
      onClick={() => {
        newModsState.mods.selectedItem = data
        state.mods.setSelectedModId(data.id)
      }}>
      {data.name}
    </Txt>
  )
})

export default observer(function SidebarModsList(props: SidebarModsListProps) {
  const {} = props
  const state = getKorusState()
  const uiState = newModsState

  useEffect(() => {
    uiState.mods.items = state.mods.mods
  }, [state.mods.mods])

  const { mods } = state.mods
  const userCreated = mods.filter(m => m.isUserScript)
  const notUserCreated = mods.filter(m => !m.isUserScript)
  return (
    <div>
      <SectionList
        hideEmptySections
        sections={[
          { section: 'My Scripts', data: userCreated },
          { section: 'Installed Scripts', data: notUserCreated },
        ]}
        renderRow={item => <SidebarListItem data={item} />}
        renderSection={(section, props) => {
          return (
            <Flex style={{ marginBottom: '3em' }}>
              <Txt
                bold
                color="#ccc"
                style={{ maxWidth: '100%', overflow: 'hidden', marginBottom: '1.5em' }}>
                {section.section}
              </Txt>
              <Flex gap={'.5em'}>{props.rows}</Flex>
            </Flex>
          )
        }}
      />
    </div>
  )
})
