import { observer } from 'mobx-react-lite'
import { Flex, Txt } from '@mtyk/frontend/core/components'
import SectionList from '../../../core/SectionList'
import getKorusState from '../../helpers/korusState'
import { newModsState } from '../../../new-mods/state/NewModsState'
import { useEffect } from 'react'
import { SidebarListItem } from './SidebarListItem'

export interface SidebarModsListProps {}

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
