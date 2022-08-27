import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Flex } from '@mtyk/frontend/core/components'
import React from 'react'
import PanelPaddingOffset from '../../../../renderer/new-ui/components/PanelPaddingOffset'
import { ModAction } from '../../../../connector/shared/state/models/Mod.model'
import { send } from '../../../bitwig-api/Bitwig'
import { Button } from '../../../core/Button'
import { settingTitle, settingShortDescription } from '../../../settings/helpers/settingTitle'
import { SettingAction } from '../../../settings/setting/SettingShortcut'
import { InfoPanelWrap } from './ActionTd'

export const InfoPanel = ({ selectedAction: action }: { selectedAction: ModAction }) => {
  const onTestAction = () => {
    send({
      type: 'api/actions/run',
      data: {
        id: action.id,
      },
    })
  }
  if (action) {
    return (
      <InfoPanelWrap>
        <Flex flexDirection="column" height="100%">
          <div style={{ flexGrow: 0 }}>
            <h1>{settingTitle(action.setting)}</h1>
            <p>{settingShortDescription(action.setting)}</p>
            <div>
              <SettingAction action={action} />
            </div>
          </div>
          <div style={{ flexGrow: 1 }} />
          <div>
            <Button onClick={onTestAction} style={{ width: '100%' }}>
              Test Action
            </Button>
          </div>
        </Flex>
      </InfoPanelWrap>
    )
  } else {
    return null
    return (
      <InfoPanelWrap>{/* <div>Select a setting to see more info.</div>         */}</InfoPanelWrap>
    )
  }
}
