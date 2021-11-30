const isRenderer = require('is-electron-renderer')
const path = require('path')

export function getAppPath(thePath = '') {
  let out = ''
  const isDev = isRenderer ? (window as any).preload.isDev : process.env.NODE_ENV === 'dev'
  if (isDev) {
    out = (isRenderer ? `safefile://` : ``) + path.join(process.cwd(), thePath)
  } else {
    if (process.env.BUILT_TEST) {
      out =
        (isRenderer ? `safefile://` : ``) +
        `/Users/andrewshand/Github/modwig/modwig-darwin-x64/modwig.app/Contents/Resources/app${thePath}`
    } else {
      out = (isRenderer ? `safefile://` : ``) + `${process.resourcesPath}/app.asar${thePath}`
    }
  }
  return out
}

export function getResourcePath(resource = '') {
  return getAppPath('/extra-resources' + resource)
}
