import { createContext } from 'react'

const EntityEditContext = createContext({
  editing: false,
  newDocument: {},
  setNewDocument: (doc: any): any => {},
  entity: '',
})

export default EntityEditContext
