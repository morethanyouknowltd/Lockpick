/// <reference path="../lockpick-mod-api.d.ts" />

/**
 * @name Forward VST Events
 * @id accept-middle-click
 * @description Allows certain events to be received by Bitwig while VST windows have focus
 * @category global
 * @os macOS
 */

const settings = {
  forwardMiddleClickToBitwig: await Mod.registerSetting({
    id: 'forward-middle-click',
    name: 'Forward Middle Click to Bitwig',
    description: `Forwards middle click to Bitwig when VST windows have focus (makes middle click panning/zooming easier)`,
  }),
  forwardToolNumbers: await Mod.registerSetting({
    id: 'forward-tools',
    name: 'Forward Tool Numbers (1 - 5)',
    description: `Allows changing tools while VST windows have focus`,
  }),
}

if (settings.forwardMiddleClickToBitwig.value) {
  Mouse.on('mousedown', event => {
    if (Bitwig.isPluginWindowActive && event.button === 1 && !event.intersectsPluginWindows()) {
      // Pretend middle mouse has gone up
      Mouse.up(1)

      Bitwig.makeMainWindowActive()

      // Go back to our "real" state
      Mouse.down(1)
    }
  })
}

if (settings.forwardToolNumbers.value) {
  const testSet = new Set(['1', '2', '3', '4', '5'])
  Keyboard.on('keydown', event => {
    if (testSet.has(event.lowerKey) && Bitwig.isPluginWindowActive) {
      // Pretend key has gone up
      Bitwig.makeMainWindowActive()
      Keyboard.keyUp(event.lowerKey)

      // Bitwig needs some time to start receiving key events it seems. May need to tweak amount
      setTimeout(() => {
        // Go back to our "real" state
        Keyboard.keyDown(event.lowerKey)
      }, 150)
    }
  })
}
