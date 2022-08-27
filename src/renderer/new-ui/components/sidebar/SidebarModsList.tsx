import { observer } from 'mobx-react-lite'
import { Flex, Txt } from '@mtyk/frontend/core/components'
import getKorusState from '../../helpers/korusState'
import { newModsState } from '../../../new-mods/state/NewModsState'
import { useEffect } from 'react'
import { SectionList } from '@mtyk/ui'
import { SidebarListItem } from './SidebarListItem'
import { newTheme } from '../../../../renderer/new-ui/helpers/newTheme'

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
    <div style={{ fontSize: '.95em' }}>
      <SectionList
        hideEmptySections
        sections={[
          { section: 'My Scripts', data: userCreated },
          { section: 'Built-in Scripts', data: notUserCreated },
        ]}
        renderRow={item => <SidebarListItem data={item} />}
        i
        renderSection={(section, props) => {
          return (
            <Flex style={{ paddingTop: '3em' }}>
              <Txt
                bold
                color="#ccc"
                style={{
                  backgroundColor: newTheme.sidebarBg,
                  maxWidth: '100%',
                  overflow: 'hidden',

                  padding: '.9em 0',
                  zIndex: 500,
                  position: 'sticky',
                  top: 0,
                }}>
                {section.section}
              </Txt>
              <Flex gap={'.5em'} style={{ paddingTop: '.5em' }}>
                {props.rows}
              </Flex>
            </Flex>
          )
        }}
      />
    </div>
  )
})
