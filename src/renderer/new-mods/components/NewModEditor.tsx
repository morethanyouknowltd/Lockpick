import { Flex, Txt } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { assert } from '@mtyk/util/assert'
import { capitalize } from 'lodash'
import { observer } from 'mobx-react-lite'
import { Mod } from '../../../connector/shared/state/models/Mod.model'
import { callAPI } from '../../bitwig-api/Bitwig'
import TextButton from '../../core/components/TextButton'
import useSelectedMod from '../hooks/useSelectedMod'
import NewMonacoEditor from './NewMonacoEditor'
import { useKey } from 'react-use'
import { ElementRef, useRef } from 'react'
import wwith from '@mtyk/frontend/core/helpers/with'
import { newTheme } from '../../new-ui/helpers/newTheme'
import Panel from '../../new-ui/components/Panel'
import ModEditorStatusBar from './ModEditorStatusBar'

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
  const monacoEditorRef = useRef<ElementRef<typeof NewMonacoEditor>>(null)

  useKey(
    e => e.key === 's' && e.metaKey,
    () => {
      if (monacoEditorRef.current) {
        const currRef = monacoEditorRef.current

        wwith(currRef.editorRef.current, c => {
          const value = c.getModel()?.getValue()
          assert(typeof value === 'string' && value.length > 0, 'value is not a string')
          callAPI('mods/update', {
            id: selectedMod.id,
            update: {
              contents: selectedMod.contents,
            },
          })
        })
      }
    }
  )

  return (
    <Panel
      style={{ width: '40%', background: newTheme.modEditorBg, padding: 0 }}
      header={
        <Flex gap={'.7em'}>
          <Txt color="#72587E">
            {selectedMod.name} {shortenedPath(selectedMod.path)}
          </Txt>

          {editability === ModEditability.ReadOnly ? (
            <Flex row gap={'.8em'}>
              <Txt>{capitalize(editability)}</Txt>
              <TextButton action={() => callAPI('mods/clone-local', { id: selectedMod.id })}>
                Clone to "My scripts"
              </TextButton>
            </Flex>
          ) : null}
        </Flex>
      }>
      <NewMonacoEditor ref={monacoEditorRef} readOnly={editability === ModEditability.ReadOnly} />
      <ModEditorStatusBar />
    </Panel>
  )
})
