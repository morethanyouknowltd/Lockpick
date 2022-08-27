import { sendPromise } from '../../bitwig-api/Bitwig'
import { Flex, FlexGrow } from '../../core/Flex'
import { state } from '../../core/State'
import { Toggle } from '../../core/Toggle'
import { ModSettingItemWrap } from './ModViewStyles'

export const ModSettingItem = ({ setting }) => {
  const onChange = async enabled => {
    await sendPromise({
      type: 'api/settings/set',
      data: {
        ...setting,
        value: {
          ...setting.value,
          enabled,
        },
      },
    })
    state.reloadMod(setting.mod)
  }
  return (
    <ModSettingItemWrap>
      <Flex alignItems="center">
        <FlexGrow>
          <div className="name">{setting.name}</div>
          <div className="desc">{setting.description}</div>
        </FlexGrow>
        <Toggle style={{ width: '3em' }} value={setting.value.enabled} onChange={onChange} />
      </Flex>
    </ModSettingItemWrap>
  )
}
