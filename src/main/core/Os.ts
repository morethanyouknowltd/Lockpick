import { APP_NAME } from '../../connector/shared/Constants'

const os = require('os')
const { Bitwig } = require('bindings')('bes')
export const isMac = () => {
  return os.platform() === 'darwin'
}

export const isWindows = () => {
  return os.platform() === 'win32'
}

export const isPreferencesActive = () => {
  return (
    Bitwig.isActiveApplication(APP_NAME) ||
    (process.env.NODE_ENV === 'dev' && Bitwig.isActiveApplication('Electron'))
  )
}
