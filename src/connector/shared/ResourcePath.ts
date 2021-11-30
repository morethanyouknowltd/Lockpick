const isRenderer = require('is-electron-renderer')
const path = require("path")

export function getAppPath(thePath = '') {
    let out = ''
    const isDev = (isRenderer ? require('electron').remote.process : process).env.NODE_ENV === 'dev'
    if (isDev) {
        out = (isRenderer ? `file://` : ``) + path.join(process.cwd(), thePath)
    } else {
        if (process.env.BUILT_TEST) {
            out = (isRenderer ? `file://` : ``) + `/Users/andrewshand/Github/modwig/modwig-darwin-x64/modwig.app/Contents/Resources/app${thePath}`
        } else {
            out = (isRenderer ? `file://` : ``) + `${process.resourcesPath}/app.asar${thePath}`
        }
    }
    return out
}

export function getResourcePath(resource = '') {
    return getAppPath('/extra-resources' + resource)
}
