const isRenderer = require('is-electron-renderer')
const path = require("path")

export function getResourcePath(resource = '') {
    let out = ''
    const isDev = (isRenderer ? require('electron').remote.process : process).env.NODE_ENV === 'dev'
    if (isDev) {
        out = (isRenderer ? `file://` : ``) + path.join(process.cwd(), 'extra-resources', resource)
    } else {
        if (process.env.BUILT_TEST) {
            out = (isRenderer ? `file://` : ``) + `/Users/andrewshand/Github/modwig/modwig-darwin-x64/modwig.app/Contents/Resources/app/extra-resources${resource}`
        } else {
            out = (isRenderer ? `file://` : ``) + `${process.resourcesPath}/app.asar/extra-resources${resource}`
        }
    }
    return out
}
