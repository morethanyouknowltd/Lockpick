import React from 'react'
import { RootSiblingParent } from 'react-native-root-siblings'

export default function AppWrap({ children }) {
  return <RootSiblingParent>{children}</RootSiblingParent>
}
