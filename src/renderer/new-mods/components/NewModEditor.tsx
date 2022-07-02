import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { capitalize } from 'lodash'
import { observer } from 'mobx-react-lite'
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import { callAPI } from '../../bitwig-api/Bitwig'
import TextButton from '../../core/components/TextButton'
import useSelectedMod from '../hooks/useSelectedMod'
import NewMonacoEditor from './NewMonacoEditor'

export interface NewModEditorProps {}

enum ModEditability {
  ReadWrite = 'read-write',
  ReadOnly = 'read-only',
}

function getModEditability(selectedMod: Mod): ModEditability {
  return selectedMod.isUserScript ? ModEditability.ReadWrite : ModEditability.ReadOnly
}

export default compose(observer)(function NewModEditor(props: NewModEditorProps) {
  const {} = props
  const selectedMod = useSelectedMod()
  const shortenedPath = (p: string) => p.replace(/\/Users\/[^/]+\//, '~/')
  const editability = getModEditability(selectedMod)

  return (
    <Flex style={{ width: '40%' }}>
      <Txt>
        {selectedMod.name} {shortenedPath(selectedMod.path)}
      </Txt>

      {editability === ModEditability.ReadOnly ? (
        <Flex row>
          <Txt>{capitalize(editability)}</Txt>
          <TextButton action={() => callAPI('mods/clone-local', { id: selectedMod.id })}>
            Clone to "My scripts"
          </TextButton>
        </Flex>
      ) : null}
      <NewMonacoEditor />
    </Flex>
  )
})
