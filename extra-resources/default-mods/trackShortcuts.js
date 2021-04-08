/**
 * @name Track Shortcuts
 * @id track-shortcuts
 * @description Various functions for managing tracks.
 * @category arranger
 */

 Mod.registerAction({
    title: "Add new return track (opening browser)",
    id: "add-new-return-track",
    category: "arranger",
    description: `Adds a new return track, opening browser straight away`,
    defaultSetting: {
        keys: ["Meta", "Alt", "T"]
    },
    action: () => {
        Bitwig.runAction([`Create Effect Track`])
        Mod.runAction('openDeviceBrowser')
    }
})

Mod.registerAction({
    title: "Add new track (opening browser)",
    id: "add-new-track",
    category: "arranger",
    description: `Adds a new track, opening browser straight away`,
    defaultSetting: {
        keys: ["Meta", "T"]
    },
    action: () => {
        Bitwig.runAction([`clear_arm`, `Create Instrument Track`])
        Mod.runAction('openDeviceBrowser')
        // Bitwig.runAction([`toggle_track_arm`])
    }
})

// Mod.registerAction({
//     title: `Expand/Collapse Selected Group Track`,
//     id: `toggle-group-track-expanded`,
//     description: `Expands of collapses the selected group track with the mouse.`,
//     category: 'arranger',
//     contexts: ['-browser'],
//     defaultSetting: {
//         keys: ["G"]
//     },
//     action: async () => {
//         const tracks = UI.MainWindow.getArrangerTracks()
//         if (tracks === null || tracks.length === 0) {
//             return log('No tracks found, spoopy...')
//         }
//         const selected = tracks.find(t => t.selected)
//         if (!selected) {
//             return showMessage(`Couldn't find selected track`)
//         }
//         selected.toggleExpandedWithMouse()
//     }
// })

// Mod.registerAction({
//     title: `Expand/Collapse Hovered Group Track`,
//     id: `toggle-hovered-group-track-expanded`,
//     description: `Expands of collapses the hovered group track with the mouse.`,
//     category: 'arranger',
//     contexts: ['-browser'],
//     defaultSetting: {
//         keys: ["Shift", "G"]
//     },
//     action: async () => {
//         const tracks = UI.MainWindow.getArrangerTracks()
//         if (tracks === null || tracks.length === 0) {
//             return log('No tracks found, spoopy...')
//         }
//         const mousePos = Mouse.getPosition()
//         const inside = tracks.find(t => mousePos.y >= t.rect.y && mousePos.y < t.rect.y + t.rect.h)
//         if (!inside) {
//             return showMessage(`Couldn't find hovered track`)
//         }
//         inside.toggleExpandedWithMouse()
//     }
// })