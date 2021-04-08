import React, { useEffect, useState } from 'react'
import { styled } from 'linaria/react'
import { send, sendPromise } from '../bitwig-api/Bitwig'
import { Select, Footer, VersionInfoWrap, SettingsIcon } from './SettingsFooterStyles'
import { Button } from '../core/Button'
import { APP_VERSION } from '../../connector/shared/Constants'
import { Flex } from '../core/Flex'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs, faTools } from '@fortawesome/free-solid-svg-icons'

const LabelledSelect = ({label, options, value, onChange, ...rest}) => {
    return <div {...rest}>
        <span style={{color: '#444', fontSize: '.9em', paddingRight: '.8em'}}>{label}</span>
        <Select value={value} onChange={onChange}>
            {options}
        </Select>
    </div>
}

const VersionInfo = ({ versionInfo }) => {
    if (!versionInfo || versionInfo.version === APP_VERSION) {
        return null
    }

    // TODO consider ARM macs
    const dlLink = process.platform === 'darwin' ? versionInfo.downloads.macx64 : versionInfo.downloads.windows
    const moreInfo = versionInfo.info + `?version=${APP_VERSION}`
    return <VersionInfoWrap>
        <div>Update available (v{versionInfo.version})</div> <Button link={dlLink}>Download</Button> <Button secondary link={moreInfo}>More info</Button>
    </VersionInfoWrap>
}

export const SettingsFooter = ({ versionInfo, preferencesOpen, togglePreferencesOpen }) => {

    const Settings = {
        'uiScale': '100%',
        'uiLayout': 'Single Display (Large)'
    }
    const state: any = {}
    for (const key in Settings) {
        const defaultVal = Settings[key]
        state[key] = useState(defaultVal)
    }
    
    useEffect(() => {
        (async () => {
            for (const key in state) {
                const { data: value } = await sendPromise({ type: 'api/settings/get', data: key })
                // console.log(value)
                state[key][1](value)
            }
        })()
    }, [1])

    const onSettingChange = setting => event => {
        const value = event.target.value
        sendPromise({ type: 'api/settings/set', data: {
            key: setting,
            value
        } })
        state[setting][1](value)
    }

    // console.log(state)
    return <Footer>
        <Flex alignItems="center">
        {/* <SettingsIcon onClick={togglePreferencesOpen}>
            <FontAwesomeIcon icon={faCogs} />
        </SettingsIcon> */}
        <VersionInfo versionInfo={versionInfo} />
        </Flex>
        <Flex alignItems="center">
            <LabelledSelect style={{marginRight: '1rem'}} label="UI Scale" value={state.uiScale[0]} onChange={onSettingChange('uiScale')} options={[
                '100%', 
                '125%', 
                '150%', 
                '175%'
            ].map(size => {
                return <option key={size} value={size}>
                    {size}
                </option>
            })} />
            <LabelledSelect label="UI Layout" value={state.uiLayout[0]} onChange={onSettingChange('uiLayout')}options={[
                // 'Single Display (Small)', 
                'Single Display (Large)'
            ].map(size => {
                return <option key={size} value={size}>
                    {size}
                </option>
            })} />
        </Flex>
    </Footer>
}