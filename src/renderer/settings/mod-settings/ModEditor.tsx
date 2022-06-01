import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Flex } from 'mtyk-frontend/core/components'
import React, { useEffect, useRef, useState } from 'react'
import { callAPI } from '../../bitwig-api/Bitwig'

loader.config({
  monaco,
})

export default function ModEditor({ mod }) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [dts, setDts] = useState(false)

  useEffect(() => {
    callAPI('/api/doc').then(dts => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(dts, '')
      setDts(true)
    })
  }, [])

  function handleEditorDidMount(editor) {
    editorRef.current = editor
  }

  return (
    <Flex style={{}}>
      {dts ? (
        <Editor
          theme="vs-dark"
          height="90vh"
          options={{ minimap: { enabled: false }, folding: false }}
          defaultLanguage="javascript"
          defaultValue={mod.contents}
          onMount={handleEditorDidMount}
        />
      ) : null}
    </Flex>
  )
}
