import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { Flex } from '@mtyk/frontend/core/components'
import React, { useEffect, useRef, useState } from 'react'
import { callAPI } from '../../bitwig-api/Bitwig'
import compose from '@mtyk/frontend/react/helpers/compose'
import { observer } from 'mobx-react-lite'
import useSelectedMod from '../hooks/useSelectedMod'

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
;(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  },
}
loader.config({
  monaco,
})

export interface NewMonacoEditorProps {}

function maybeFixModule(module: string) {
  if (module.indexOf('export') === -1) {
    return `${module}\n\nexport {}\n`
  }
  return module
}

const theme = monaco.editor.defineTheme('lockpick-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '#808080' },
    { token: 'string', foreground: '#5588D3' },
    // { token: 'number', foreground: '#ff0000' },
    // { token: 'identifier', foreground: '#C166F1' },

    // { token: 'keyword', foreground: '#4560BC' },
    { token: 'keyword', foreground: '#C166F1' },
  ],
  colors: {
    'editor.foreground': '#ffffff',
  },
})

export default compose(observer)(function NewMonacoEditor({}: NewMonacoEditorProps) {
  const selectedMod = useSelectedMod()

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [dts, setDts] = useState(false)

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current

      const currModel = editor.getModel()
      editor.setModel(null)
      currModel?.dispose()

      const newModel = monaco.editor.createModel(maybeFixModule(selectedMod.contents), 'typescript')
      editor.setModel(newModel)
    }
  }, [selectedMod.id])

  useEffect(() => {
    callAPI('api/doc').then(({ data: dts }) => {
      console.log(dts)
      loader.init().then(() => {
        console.log('hello???', selectedMod)
        monaco.languages.typescript.typescriptDefaults.addExtraLib(dts)
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ESNext,
          module: monaco.languages.typescript.ModuleKind.ESNext,
          allowNonTsExtensions: true,
        })
        setDts(true)
      })
    })
  }, [])

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor
  }

  return (
    <Flex grow={1}>
      {dts ? (
        <Editor
          theme={'lockpick-dark'}
          // height="100vh"
          options={{ minimap: { enabled: false }, folding: false, fontSize: 12 }}
          defaultLanguage="typescript"
          defaultValue={maybeFixModule(selectedMod.contents)}
          onMount={handleEditorDidMount}
        />
      ) : null}
    </Flex>
  )
})
