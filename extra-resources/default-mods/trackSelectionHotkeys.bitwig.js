/**
 * @name Track Selection Hotkeys
 * @id track-selection-hotkeys
 * @description Provides 10 shortcuts for saving track hotkeys for quick navigation
 * @category global
 * @disabled
 */

packetManager.listen('track-selection-hotkeys/send-tracks', () => {
    globalController.sendAllTracks()
})
