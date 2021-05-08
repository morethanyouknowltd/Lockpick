
import * as p from 'path'

export function url(path) {
    if (process.env.NODE_ENV === 'dev')     {
        if (process.env.DEV_SERVER === 'true') {
            return 'http://localhost:8081' + path
        } else {
            return `file://${p.join(process.cwd(), 'dist', 'index.html')}${path.substr(1)}`
        }
    } else {
        return `file://${process.resourcesPath}/app.asar/dist/index.html${path.substr(1)}`
    }
}