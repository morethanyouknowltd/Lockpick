const os = require('os')

export const isMac = () => {
    return os.platform() === 'darwin'
}

export const isWindows = () => {
    return os.platform() === 'win32'
}