import { observer } from 'mobx-react-lite'
import { Flex } from 'mtyk-frontend/core/components'
import React, { useEffect } from 'react'
import { sendPromise } from '../../bitwig-api/Bitwig'
import { state } from '../../core/State'
import { TabbedView } from '../../core/TabbedView'
import { Toggle } from '../../core/Toggle'
import { ModDebug } from '../ModDebug'
import { ModError } from '../ModError'
import { ShortcutsView } from '../ShortcutsView'
import ModEditor from './ModEditor'
import { ModSettingItem } from './ModSettingItem'
import {
  Badge,
  ModContent,
  ModRow,
  ModSettings,
  SettingDesc,
  SettingTitle,
  Wrap,
} from './ModViewStyles'

export const ModView = observer(({ modId }: any) => {
  const mod = state.modsById[modId]

  useEffect(() => {
    state.reloadMod(modId)
  }, [modId])
  const onToggleChange = async enabled => {
    await sendPromise({
      type: 'api/settings/set',
      data: {
        ...mod,
        value: {
          ...mod.value,
          enabled,
        },
      },
    })
  }

  return (
    <Wrap>
      <div
        style={{
          left: 0,
          width: mod.actions.length ? '30%' : '100%',
          borderRight: mod.actions.length ? '1px solid #191919' : '',
        }}>
        <Flex style={{ height: '100%' }} column>
          <ModRow key={mod.id} id={mod.key} style={{ paddingBottom: '4em', flexGrow: 0 }}>
            <Flex rowCenter between>
              <SettingTitle style={{ fontSize: '1em' }}>
                {mod.name} {mod.isDefault ? null : <Badge>User</Badge>}
              </SettingTitle>
              <Toggle onChange={onToggleChange} value={mod.value.enabled} />
            </Flex>
            <ModEditor mod={mod} />
            {/* <SettingPath>{mod.path} <SearchIconWrap onClick={() => require('electron').remote.shell.showItemInFolder(mod.path)} /></SettingPath> */}
            <SettingDesc style={{ maxWidth: '40rem', fontSize: '.9em', marginTop: `1.2rem` }}>
              {mod.description}
            </SettingDesc>
            {/* <div style={{ background: `#161616`, padding: `2rem 4rem`, paddingTop: `0` }}>
              <SettingItem
                focused={false}
                key={mod.id}
                setting={{
                  ...mod,
                  description: `Toggle all actions and related functionality for ${mod.name}.`,
                  name: `Enable/Disable ${mod.name}`,
                }}
              />
              {mod.actions.map(action => {
                return <SettingItem focused={false} key={action.id} setting={action} />
              })}
            </div> */}
            {mod.error ? <ModError mod={mod} /> : null}
          </ModRow>
          <div style={{ flexGrow: 1, background: 'rgb(29 29 29)', position: 'relative' }}>
            <TabbedView
              tabs={[
                mod.settings?.length ?? 0
                  ? {
                      name: 'Settings',
                      component: () => {
                        return (
                          <ModSettings>
                            {mod.settings
                              .filter(sett => !sett.hidden)
                              .map(sett => {
                                return <ModSettingItem key={sett.key} setting={sett} />
                              })}
                          </ModSettings>
                        )
                      },
                    }
                  : null,
                process.env.NODE_ENV === 'dev'
                  ? {
                      name: 'Debug',
                      component: () => {
                        return <ModDebug mod={mod} />
                      },
                    }
                  : null,
              ].filter(t => !!t)}
            />
          </div>
        </Flex>
      </div>
      {mod.actions.length ? (
        <div style={{ left: '30%', right: '0' }}>
          <ShortcutsView selectedMod={mod} settings={mod.actions} />
        </div>
      ) : null}
    </Wrap>
  )
})
