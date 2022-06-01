import { useContext } from 'react'
import EntityEditContext from '../context/EntityEditContext'

function useEntityEditContext() {
  return useContext(EntityEditContext)
}

export default useEntityEditContext
