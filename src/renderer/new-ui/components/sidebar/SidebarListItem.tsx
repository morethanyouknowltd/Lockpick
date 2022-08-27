import { Flex } from '@mtyk/frontend/core/components'
import TextButton from '@mtyk/frontend/core/components/TextButton'
import { circle } from '@mtyk/frontend/styles/helpers/styleObjects'
import { observer } from 'mobx-react-lite'
import { Mod } from '../../../../connector/shared/state/models/Mod.model'
import { newModsState } from '../../../new-mods/state/NewModsState'
import getKorusState from '../../helpers/korusState'

export const SidebarListItem = observer(function ItemComponent({ data }: { data: Mod }) {
  const state = getKorusState()
  const isModSelected = newModsState.mods.selectedItem?.id === data.id

  // console.log({ isModSelected, mods: newModsState.mods.map(mod => mod._id) })
  const color = isModSelected ? '#E45AFF' : data.active ? '#ffffff' : '#666'
  return (
    <TextButton
      color={color}
      action={() => {
        newModsState.mods.selectedItem = data
        state.mods.setSelectedModId(data.id)
      }}
      style={{ position: 'relative' }}>
      {isModSelected ? (
        <Flex
          style={{
            position: 'absolute',
            top: '50%',
            ...circle(6),
            backgroundColor: 'purple',
            right: '100%',

            transform: `translate(-150%, -50%)`,
          }}
        />
      ) : null}
      {data.name}
    </TextButton>
  )
})
