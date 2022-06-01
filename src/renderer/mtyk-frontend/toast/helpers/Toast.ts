import { config } from '../../core/helpers/config'

function toast(type, ...args) {
  if (config.isNative) {
    const Toast = require('react-native-root-toast').default
    Toast.show()
  } else {
    // hot toast
  }
}
const Toast = {
  success: (msg: string) => toast('success', msg),
  error: (msg: string) => toast('error', msg),
}

export default Toast
