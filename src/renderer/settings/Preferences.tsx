import React from 'react'
import { styled } from 'linaria/react'
import { observer } from 'mobx-react-lite'
import { state } from '../core/State'
import { sendPromise } from '../bitwig-api/Bitwig'
import { withRouter } from 'react-router-dom'

const PreferencesWrap = styled.div`
    .title {

    }
    color: white;
    position: absolute;
    bottom: 4rem;
    left: 2rem;
    width: 21rem;
    border-radius: .3rem;
    background: black;
    padding: 1em 2em;
    font-size: .9em;
    box-shadow: 0px 0px 0px 999vw rgba(0, 0, 0, .3), 0 0 1rem rgba(0, 0, 0, .6);
`

const Cover = styled.div`
    position: fixed;
    top: 0; bottom: 0; right: 0; left: 0;
    background: rgba(0, 0, 0, 0.3);
`
const InputCheckbox = styled.input``

const PrefTab = ({children, title}) => {
    return <div>
        { children }
    </div>
}


const CheckLabelWrap = styled.div`
    display: flex;
    align-items: center;
    >:nth-child(1) {
        margin-right: .5em;
    }
    margin-bottom: .1em;
`
const BoolCheckSetting = observer(({setting, title}) => {
    const actualSetting = state.settingsByKey[setting]
    const onCheckboxChange = async event => {
        await sendPromise({ type: 'api/settings/set', data: {
            key: setting,
            value: { enabled: event.target.checked }
        } })
        // Make sure the state is updated
        state.loadSettings([setting])
    }
    return <CheckLabelWrap>
        <InputCheckbox type="checkbox" checked={actualSetting?.value.enabled || false} onChange={onCheckboxChange} />
        {title}
    </CheckLabelWrap>
}) as any

export const Preferences = withRouter(({ history }) => {
    state.loadSettings([
        `notifications-actions`,
        `notifications-reloading`
    ])

    // find out if setup complete
    return <div>
        <Cover onClick={() => history.push('/settings')} />
        <PreferencesWrap>
            <PrefTab title="Notifications">
                <div style={{
                    color: `#888`,
                    marginBottom: `.5rem`
                }}>Show notifications when:</div>

                <BoolCheckSetting setting={`notifications-actions`} title={`Shortcuts Triggered`} />
                <BoolCheckSetting setting={`notifications-reloading`} title={`Mods Reloaded`} />
            </PrefTab>
        </PreferencesWrap>
    </div>
})