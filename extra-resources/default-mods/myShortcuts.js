/// <reference path="../lockpick-mod-api.d.ts" />
/**
 * @name My Shortcuts
 * @id andys-shortcuts
 * @disabled
 */

Mod.registerShortcutMap({
  'Alt Shift Q': async () => {
    // Q to add eq to end
    if (!Bitwig.isBrowserOpen) {
      Mod.runActions('insertDeviceAtEnd', 'selectBrowserTab2')
      await wait(250)
      Keyboard.type('q', { lockpickListeners: true })
      await wait(250)
      Keyboard.keyPress('Enter', { lockpickListeners: true })
    }
  },
  'Alt 1': async () => {
    if (!Bitwig.isBrowserOpen) {
      Bitwig.runAction(['Loop Selected Region'])
    }
  },
  'Alt Shift 1': async () => {
    if (!Bitwig.isBrowserOpen) {
      Bitwig.runAction(['Loop Selected Region', 'Jump to Playback Start Time', 'Play'])
    }
  },
})

// Bitwig.on('transportStateChanged', state => {
//     if (state === 'playing') {
//         Bitwig.showMessage('pressing =')
//         Keyboard.keyDown('[')
//     } else {
//         Bitwig.showMessage('pressing shift =')
//         Keyboard.keyDown(']')
//     }
// })
