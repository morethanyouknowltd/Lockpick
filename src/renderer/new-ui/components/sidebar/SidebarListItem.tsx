import { Flex } from '@mtyk/frontend/core/components'
import TextButton from '@mtyk/frontend/core/components/TextButton'
import HoverableThing from '@mtyk/frontend/tooltips/components/HoverableThing'
import { observer } from 'mobx-react-lite'
import { Mod } from '../../../../connector/shared/state/models/Mod.model'
import PopoverWrap from '../../../core/components/PopoverWrap'
import ModPreviewTooltip from '../../../new-mods/components/ModPreviewTooltip'
import { newModsState } from '../../../new-mods/state/NewModsState'
import getKorusState from '../../helpers/korusState'

export const SidebarListItem = observer(function ItemComponent({ data }: { data: Mod }) {
  const state = getKorusState()
  const isModSelected = newModsState.mods.selectedItem?.id === data.id
  const color = isModSelected ? '#E45AFF' : !data.disabled ? '#ddd' : '#666'
  return (
    <HoverableThing
      options={{ delayShow: 500 }}
      tooltipStyle={{ zIndex: 999999 }}
      tooltip={
        <PopoverWrap>
          <ModPreviewTooltip mod={data} />
        </PopoverWrap>
      }>
      <Flex gap=".6em" rowCenter style={{ margin: '.1em 0' }}>
        <TextButton
          color={color}
          action={() => {
            newModsState.mods.selectedItem = data
            state.mods.setSelectedModId(data.id)
          }}
          style={{
            position: 'relative',
            overflow: 'hidden',
            fontWeight: isModSelected ? 'bold' : 'normal',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}>
          {data.name}
        </TextButton>
      </Flex>
    </HoverableThing>
  )
})
