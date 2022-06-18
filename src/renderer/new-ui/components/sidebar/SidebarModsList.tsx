import { observer } from 'mobx-react-lite'
import { Txt } from 'mtyk-frontend/core/components'
import { Mod } from '../../../../connector/shared/state/models/Mod.model'
import SectionList from '../../../core/SectionList'
import getKorusState from '../../helpers/korusState'

export interface SidebarModsListProps {}

const ItemComponent = observer(function ItemComponent({ data }: { data: Mod }) {
  const state = getKorusState()
  const isModSelected = state.mods.selectedModId === data.id
  const color = isModSelected ? '#E45AFF' : data.active ? '#ffffff' : '#666'
  return (
    <Txt
      color={color}
      onClick={() => {
        state.mods.setSelectedModId(data.id)
      }}>
      {data.name}
    </Txt>
  )
})

export default observer(function SidebarModsList(props: SidebarModsListProps) {
  const {} = props
  const state = getKorusState()
  const { mods } = state.mods

  const userCreated = mods.filter(m => m.isUserScript)
  const notUserCreated = mods.filter(m => !m.isUserScript)
  return (
    <SectionList
      ItemComponent={ItemComponent}
      sections={[
        { section: 'My Scripts', data: userCreated },
        { section: 'Installed Scripts', data: notUserCreated },
      ]}
    />
  )
})
