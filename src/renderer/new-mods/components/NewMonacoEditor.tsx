import Editor, { loader } from '@monaco-editor/react'
import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { observer } from 'mobx-react-lite'
import * as monaco from 'monaco-editor'
import {
  forwardRef,
  MutableRefObject,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { callAPI } from '../../bitwig-api/Bitwig'
import { maybeFixModule } from '../helpers/maybeFixModule'
import registerMonacoTheme from '../helpers/registerMonacoTheme'
import setupMonaco from '../helpers/setupMonaco'
import useSelectedMod from '../hooks/useSelectedMod'
setupMonaco()
registerMonacoTheme()

export interface NewMonacoEditorProps {
  readOnly?: boolean
}
export interface NewMonacoEditorRefHandle {
  editorRef: MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
}

export default compose(observer)(
  forwardRef(function NewMonacoEditor(
    props: NewMonacoEditorProps,
    ref: Ref<NewMonacoEditorRefHandle>
  ) {
    const selectedMod = useSelectedMod()
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
    const [dts, setDts] = useState(false)

    useImperativeHandle(ref, () => {
      return {
        editorRef,
      }
    })

    useEffect(() => {
      if (editorRef.current) {
        const editor = editorRef.current

        const currModel = editor.getModel()
        editor.setModel(null)
        currModel?.dispose()

        const newModel = monaco.editor.createModel(
          maybeFixModule(selectedMod.contents),
          'typescript'
        )

        if (props.readOnly) {
          editor.updateOptions({ readOnly: props.readOnly })
        }

        editor.setModel(newModel)
      }
    }, [selectedMod.id])

    useEffect(() => {
      callAPI('api/doc').then(({ data: dts }) => {
        loader.init().then(() => {
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
      <Flex grow={1} style={{}}>
        {dts ? (
          <Editor
            theme={'lockpick-dark'}
            // height="100vh"
            options={{
              wordWrap: 'on',
              glyphMargin: false,
              folding: false,
              lineNumbers: 'off',
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 0,
              minimap: { enabled: false },
              fontSize: 12,
            }}
            defaultLanguage="typescript"
            defaultValue={maybeFixModule(selectedMod.contents)}
            onMount={handleEditorDidMount}
          />
        ) : null}
      </Flex>
    )
  })
)
