/// <reference path="../lockpick-mod-api.d.ts" />

/**
 * @name VST Undo
 * @id vst-undo-local
 * @description Supports undo/redo for specific VSTs when focused. At the moment, only supports Fabfilter
 * @category global
 */

function undoRedoFabfilter(redo, window) {
  // showMessage((redo ? `Redoing` : `Undoing`) + ' Fabfilter')
  const toolbarWidth = 850
  const spaceWithoutToolbar = window.w - toolbarWidth
  const toolbarStart = Math.max(0, spaceWithoutToolbar / 2)
  const windowBorderHeight = 15
  const pluginYInset = 18
  const y = window.y + windowBorderHeight + pluginYInset

  const position = redo
    ? { x: window.x + toolbarStart + 345, y }
    : { x: window.x + toolbarStart + 315, y }

  Mouse.click({
    ...position,
    returnAfter: true,
  })
}

function undoOrRedo(redo) {
  const focused = Bitwig.getFocusedPluginWindow()
  if (Bitwig.isPluginWindowActive && focused) {
    undoRedoFabfilter(redo, focused)
  } else {
    // showMessage('Running bitwig action')
    Bitwig.runAction(redo ? 'Redo' : 'Undo')
  }
}

Mod.registerAction({
  title: `VST Undo`,
  id: `vst-undo`,
  description: `Undo`,
  contexts: ['-browser'],
  defaultSetting: {
    keys: ['Meta', 'Z'],
  },
  action: async () => {
    undoOrRedo()
  },
})

Mod.registerAction({
  title: `VST Redo`,
  id: `vst-redo`,
  description: `Redo`,
  contexts: ['-browser'],
  defaultSetting: {
    keys: ['Meta', 'Shift', 'Z'],
  },
  action: async () => {
    undoOrRedo(true)
  },
})

Mod.registerAction({
  title: `VST Fullscreen Toggle`,
  id: `vst-fullscreen`,
  description: `Toggles between fullscreen and previous size`,
  contexts: ['-browser'],
  defaultSetting: {
    keys: ['f'],
  },
  action: async () => {
    const { positions, state } = await Db.getCurrentTrackData()
    const mainWindowFrame = MainDisplay.getDimensions()
    const pluginWindows = Bitwig.getPluginWindowsPosition()
    for (const key in pluginWindows) {
      const data = pluginWindows[key]
      if (data.focused || Object.keys(pluginWindows[key]).length === 1) {
        if (data.x === 0) {
          // Fullscreen probably
          // Bitwig.showMessage('is fullscreen, going small')
          Bitwig.setPluginWindowsPosition({
            ...positions,
          })
        } else {
          // Go fullscreen now
          // Bitwig.showMessage('is small, going fullscreen')
          Db.setCurrentTrackData({
            // Only save current positions if we went from onscreen to offscreen
            positions: pluginWindows,
          })
          const newObj = {
            ...pluginWindows,
            [key]: {
              ...data,
              w: mainWindowFrame.w,
              h: mainWindowFrame.h,
              x: 0,
              y: 0,
            },
          }
          // Bitwig.showMessage(JSON.stringify(newObj[key]))
          Bitwig.setPluginWindowsPosition(newObj)
        }
        return
      }
    }
  },
})
