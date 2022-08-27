const { contextBridge } = require('electron')
const os = require('os')
const _ = require('underscore')
const { promises: fs } = require('fs')
const path = require('path')
const { getResourcePath } = require('./connector/shared/ResourcePath')

const toExport = {
  os: {
    isMac: () => os.platform() === 'darwin',
    isWindows: () => os.platform() === 'win32',
  },
  openUrl: url => {
    require('electron').shell.openExternal(url)
  },
  isDev: process.env.NODE_ENV === 'dev',
  path: _.pick(path, ['join']),
  clipboard: _.pick(
    {
      writeText: () => {},
    },
    ['writeText']
  ),
  getResourcePath,
  setup: {
    isDirectoryValid: async dir => {
      const subDirs = ['Auto Mappings', 'Controller Scripts', 'Extensions', 'Library', 'Projects']
      let oneExists = false
      for (const subDir of subDirs) {
        try {
          oneExists = oneExists || (await fs.stat(path.join(dir, subDir))).isDirectory()
        } catch (e) {
          console.error(e)
        }
      }
      return oneExists
    },
  },
}

contextBridge.exposeInMainWorld('preload', toExport)
window.preload = toExport
