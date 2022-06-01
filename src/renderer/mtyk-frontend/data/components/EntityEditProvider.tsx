import React, { useState } from 'react'
import EntityEditContext from '../context/EntityEditContext'

function EntityEditProvider({
  entity,
  children,
  newDocument: _newDocument,
}: {
  newDocument?: any
  children?: any
  entity: string
}) {
  const [newDocument, setNewDocument] = useState(_newDocument)
  return (
    <EntityEditContext.Provider value={{ editing: true, entity, newDocument, setNewDocument }}>
      {children}
    </EntityEditContext.Provider>
  )
}

export default EntityEditProvider
