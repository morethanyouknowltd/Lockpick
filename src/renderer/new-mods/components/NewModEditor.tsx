import { Flex } from '@mtyk/frontend/core/components'
import compose from '@mtyk/frontend/react/helpers/compose'
import { observer } from 'mobx-react-lite'
import NewMonacoEditor from './NewMonacoEditor'

export interface NewModEditorProps {}

export default compose(observer)(function NewModEditor(props: NewModEditorProps) {
  const {} = props

  return (
    <Flex style={{ width: '40%' }}>
      <NewMonacoEditor />
    </Flex>
  )
})
