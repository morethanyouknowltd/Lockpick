import compose from '@mtyk/frontend/react/helpers/compose'
import { Optional } from '@mtyk/types'
import { groupBy } from 'lodash'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { ModAction } from '../../../../connector/shared/state/models/Mod.model'
import { Warning } from '../../../core/Warning'
import Panel from '../../../new-ui/components/Panel'
import {
  settingTitle as actionTitle,
  shortcutToTextDescription,
  shouldShortcutWarn,
} from '../../../settings/helpers/settingTitle'
import useSelectedMod from '../../hooks/useSelectedMod'
import { ActionTd, ShortcutTableCell, TableWrap } from './ActionTd'
import { InfoPanel } from './InfoPanel'
import { PlayButton } from './PlayButton'
import ShortcutsHeader from './ShortcutsHeader'

export interface NewModShortcutsProps {}

export default compose(observer)(function NewModShortcuts(props: NewModShortcutsProps) {
  const [selectionAction, setSelectedAction] = useState<Optional<ModAction>>()
  const selectedMod = useSelectedMod()
  const actions = Object.values(selectedMod.actions)
  const actionsByCategory = groupBy(actions, sett => 'Default')
  // sett.category ? sett.category.title : null
  // )

  return (
    <Panel grow header={<ShortcutsHeader />}>
      <TableWrap enabled={!selectedMod.disabled}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              {selectedMod ? null : <th>Mod</th>}
              <th>Shortcut</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(actionsByCategory).map((category, catI) => {
              const actions = actionsByCategory[category]
              const actionsRows = actions
                .sort((a, b) => {
                  const aParts = (a.title ?? '').split(' ')
                  const bParts = (b.title ?? '').split(' ')
                  const noEnd = (p: any[]) => p.slice(0, p.length - 1).join(' ')
                  const [numberA, numberB] = [
                    parseFloat(aParts[aParts.length - 1]),
                    parseFloat(bParts[bParts.length - 1]),
                  ]
                  // console.log(noEnd(aParts), noEnd(bParts), numberA, numberB)
                  if (noEnd(aParts) === noEnd(bParts) && !isNaN(numberA) && !isNaN(numberB)) {
                    // if both end in number and have the same rest of text, compare the numbers
                    return numberA - numberB
                  }
                  return a.title < b.title ? -1 : 1
                })
                .map(action => {
                  const onShortcutClick = () => {
                    setTimeout(() => {
                      document.getElementById(`SettingShortcut${action.id}`)?.focus()
                    }, 100)
                  }
                  return (
                    <tr
                      key={action.id}
                      onClick={() => setSelectedAction(action)}
                      style={
                        action.id === (selectionAction?.id ?? null) ? { background: '#111' } : {}
                      }>
                      <ActionTd style={{ position: 'relative' }}>
                        <PlayButton action={action} />
                        {actionTitle(action)}
                      </ActionTd>
                      <td onClick={onShortcutClick}>
                        {(action.setting.value?.keys?.length ?? 0) === 0 ? (
                          <span id="quickset">Click to set...</span>
                        ) : null}
                        <ShortcutTableCell>
                          {shortcutToTextDescription(action.setting)}
                          {shouldShortcutWarn(action.setting) ? (
                            <Warning
                              title={`Please note it's currently not possible to prevent single character shortcuts from triggering in text fields`}
                            />
                          ) : null}
                        </ShortcutTableCell>
                      </td>
                    </tr>
                  )
                })
              const categoryRow = (
                <tr
                  className="nonrow"
                  key={'cat' + category}
                  style={{
                    height: catI === 0 ? '' : '4.2em',
                    verticalAlign: 'bottom',
                    paddingBottom: '.5em',
                  }}>
                  <td
                    style={{
                      color: '#656565',
                      fontSize: '1em',
                    }}>
                    {String(category) === 'null' ? 'General' : category}
                  </td>
                  <td></td>
                </tr>
              )
              return (
                <React.Fragment key={'cat' + category}>
                  {categoryRow}
                  {actionsRows}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </TableWrap>
      {selectionAction ? <InfoPanel selectedAction={selectionAction} /> : null}
    </Panel>
  )
})
