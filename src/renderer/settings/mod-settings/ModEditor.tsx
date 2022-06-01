import { Flex } from 'mtyk-frontend/core/components'
import React, { useRef } from 'react'
import * as monaco from 'monaco-editor'
import Editor, { loader } from '@monaco-editor/react'
loader.config({
  monaco,
})

export default function ModEditor({ mod }) {
  const editorRef = useRef(null)

  function handleEditorDidMount(editor) {
    console.log('editorDidMount')
    editorRef.current = editor
  }

  function showValue() {
    alert(editorRef.current?.getValue())
  }

  return (
    <Flex style={{}}>
      <button onClick={showValue}>Show value</button>
      <Editor
        theme="vs-dark"
        height="90vh"
        options={{ minimap: { enabled: false }, folding: false }}
        defaultLanguage="javascript"
        defaultValue={mod.contents}
        onMount={handleEditorDidMount}
      />
    </Flex>
  )
}
