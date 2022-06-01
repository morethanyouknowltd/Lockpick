import * as conditionalImports from './conditionalImports'

export default typeof conditionalImports.ReactNative !== 'undefined' &&
  Object.keys(conditionalImports.ReactNative ?? {}).length > 0
