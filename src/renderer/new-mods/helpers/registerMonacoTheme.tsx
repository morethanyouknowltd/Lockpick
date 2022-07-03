import * as monaco from 'monaco-editor'
import { newTheme } from '../../new-ui/helpers/newTheme'

export default function registerMonacoTheme() {
  monaco.editor.defineTheme('lockpick-dark', {
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
      'editor.background': newTheme.modEditorBg,
      'editor.foreground': '#ffffff',
    },
  })
}
