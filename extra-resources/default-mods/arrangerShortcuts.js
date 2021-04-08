/**
 * @name Arranger Shortcuts
 * @id arranger-shortcuts
 * @description All shortcuts related to the arranger.
 * @category arranger
 */

Mod.registerAction({
    title: 'Toggle Large Track Height*',
    id: 'toggle-large-track-height',
    description: `Toggles large track height, ensuring the arranger is focused first so the shortcut works when expected.`,
    defaultSetting: {
        keys: ['Shift', 'C']
    },
    action: () => {
        Bitwig.sendPacket({
            type: 'action',
            data: [
                'focus_track_header_area',
                'toggle_double_or_single_row_track_height'
            ]
        })
    }
})

Mod.registerAction({
    title: 'Focus Track Header Area*',
    id: 'focus-track-header-area',
    description: "Focuses the track header area regardless of what is currently focused",
    defaultSetting: {
        keys: ['T']
    },
    contexts: ['-browser'],
    action: () => {
        sendPacketToBitwig({type: 'action', data: 'focus_track_header_area'})
        Bitwig.makeMainWindowActive()
    } 
})