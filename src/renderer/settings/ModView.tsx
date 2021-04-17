import React, { useEffect, useState } from 'react'
import { sendPromise } from '../bitwig-api/Bitwig'
import { Flex, FlexGrow } from '../core/Flex'
import { Toggle } from '../core/Toggle'
import { observer } from "mobx-react-lite"
import { Badge, ModAndLogs, ModContent, ModRow, ModSettingItemWrap, ModSettings, SearchIconWrapStyle, SettingDesc, SettingPath, SettingTitle, ToggleAndText, Wrap } from './ModViewStyles'
import { state } from '../core/State'
import { ShortcutsView } from './ShortcutsView'
import { TabbedView } from '../core/TabbedView'
import { ModDebug } from './ModDebug'
import { AbsoluteFill } from '../core/AbsoluteFill'
import { ModError } from './ModError'

const ModSettingItem = ({ setting }) => {
    const onChange = async enabled => {
        await sendPromise({
            type: 'api/settings/set',
            data: {
                ...setting,
                value: {
                    ...setting.value,
                    enabled
                }
            }
        })
        state.reloadMod(setting.mod)
    }
    return <ModSettingItemWrap>
        <Flex alignItems="center">
            <FlexGrow>
                <div className="name">{setting.name}</div>
                <div className="desc">{setting.description}</div>
            </FlexGrow>
            <Toggle style={{width: '3em'}} value={setting.value.enabled} onChange={onChange} />
        </Flex>

    </ModSettingItemWrap>
}

export const ModView = observer(({ modId } : any) => {
    const mod = state.modsById[modId]
    const [tab, setTab] = useState('settings')

    useEffect(() => {
        state.reloadMod(modId)
    }, [modId])
    const onToggleChange = async (enabled) => {
        await sendPromise({
            type: 'api/settings/set',
            data: {
                ...mod,
                value: {
                    ...mod.value,
                    enabled
                }
            }
        })
    }
    // console.log(mod)
    return <Wrap>
        <div style={{left: 0, width: mod.actions.length ? '30%' : '100%', borderRight: mod.actions.length ? '1px solid #191919' : ''}}>
            <Flex height="100%" flexDirection="column">
                <ModRow key={mod.id} id={mod.key} style={{paddingBottom: '4em', flexGrow: 0}}>
                    <ModContent>
                        <div>
                            <Flex alignItems="center" justifyContent="space-between">
                                <SettingTitle style={{fontSize: '1em'}}>{mod.name} {mod.isDefault ? null : <Badge>User</Badge>}</SettingTitle>
                                <Toggle onChange={onToggleChange} value={mod.value.enabled} />
                            </Flex>
                            {/* <SettingPath>{mod.path} <SearchIconWrap onClick={() => require('electron').remote.shell.showItemInFolder(mod.path)} /></SettingPath> */}
                            <SettingDesc style={{maxWidth: '40rem', fontSize: '.9em', marginTop: `1.2rem`}}>{mod.description}</SettingDesc>
                        </div>
                        
                    </ModContent>
                    {/* <div style={{background: `#161616`, padding: `2rem 4rem`, paddingTop: `0`}}>
                        <SettingItem focused={false} key={mod.id} setting={{...mod, description: `Toggle all actions and related functionality for ${mod.name}.`, name: `Enable/Disable ${mod.name}`}} />
                        {mod.actions.map(action => {
                            return <SettingItem focused={false} key={action.id} setting={action} />
                        })}
                    </div> */}
                    {mod.error ? <ModError mod={mod} /> : null}
                </ModRow> 
                <div style={{flexGrow: 1, background: 'rgb(29 29 29)', position: 'relative'}}>
                   
                        <TabbedView tabs={
                        [
                            (mod.settings?.length ?? 0) ? {
                                name: 'Settings',
                                component: () => {
                                    return <ModSettings>
                                        {mod.settings.filter(sett => !sett.hidden).map(sett => {
                                            return <ModSettingItem key={sett.key} setting={sett} />
                                        })}
                                    </ModSettings>
                                }
                            } : null,
                            process.env.NODE_ENV === 'dev' ? {
                                name: 'Debug',
                                component: () => {
                                    return <ModDebug mod={mod} />
                                }
                            } : null
                        ].filter(t => !!t)
                    } />
                </div>
                
           </Flex>
        </div>
        {mod.actions.length ? <div style={{left: '30%', right: '0'}}>
            <ShortcutsView selectedMod={mod} settings={mod.actions} />
        </div> : null}
    </Wrap>
})