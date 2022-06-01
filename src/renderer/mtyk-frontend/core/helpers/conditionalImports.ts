import assert from './assert'
import * as browser from './conditionalImportsBrowser'
import * as native from './conditionalImportsNative'

const out: typeof browser & typeof native = {} as any

// assumes native and browser have matching keys, or following for loop won't work
// assert(
//   Object.keys(browser).join('') === Object.keys(native).join(''),
//   `Browser and native dependency keys should match: ${Object.keys(browser)}`
// )

let b = browser as any
let n = native as any
// Get whichever value isn't an empty object during dev
for (const k in browser) {
  ;(out as any)[k] = JSON.stringify(b[k]) === '{}' ? n[k] : b[k]
}

export const {
  ReactNative,
  NextRouter,
  ReactNativeReanimated,
  FontAwesomeIcon,
  ReactRouterNative,
  ReactNativeSvg,
} = out
