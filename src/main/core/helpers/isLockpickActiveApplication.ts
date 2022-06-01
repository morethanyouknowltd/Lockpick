import { APP_NAME } from '../../../connector/shared/Constants'

const { Bitwig } = require('bindings')('bes')

export default function isLockpickActiveApplication() {
  return (
    Bitwig.isActiveApplication() ||
    (process.env.NODE_ENV === 'dev'
      ? Bitwig.isActiveApplication('Electron')
      : Bitwig.isActiveApplication(APP_NAME))
  )
}
