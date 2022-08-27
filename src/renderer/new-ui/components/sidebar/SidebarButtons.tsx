import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import LockpickButton from 'renderer/core/components/Button'
import { LockpickIcons } from 'renderer/core/components/LockpickIcons'
const { openUrl } = (window as any).preload

export interface SidebarButtonsProps {}
export interface SidebarButtonsRefHandle {}

export default compose()(function SidebarButtons(props: SidebarButtonsProps) {
  const {} = props
  return (
    <Flex rowCenter gap="1em" between>
      <Flex gap=".2em" style={{ color: '#999' }}>
        <Txt size=".8em">Lockpick</Txt>
        <Txt size=".9em" medium>
          v{__APP_VERSION__}
        </Txt>
      </Flex>
      <Flex gap=".9em" rowCenter>
        <LockpickButton
          borderless
          id="support"
          description="Support"
          icon={LockpickIcons.heart}
          iconProps={{ color: 'red' }}
          action={() => {
            openUrl('https://www.patreon.com/mtyk')
          }}
        />
        <LockpickButton
          borderless
          id="issues"
          description="Report a bug"
          icon={LockpickIcons.bug}
          action={() => {
            openUrl('https://github.com/morethanyouknowltd/lockpick/issues/new')
          }}
        />
        <LockpickButton
          borderless
          id="discord"
          description="Discord"
          icon={LockpickIcons.discord}
          action={() => {
            openUrl('https://discord.gg/6Wetp3ZsKv')
          }}
        />
      </Flex>
    </Flex>
  )
})
