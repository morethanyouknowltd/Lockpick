
/**
 * @name Device Shortcuts
 * @id device-shortcuts
 * @category devices
 */

const categories = {
    selection: Mod.registerActionCategory({title: "Selection"}),
    collapseExpanding: Mod.registerActionCategory({title: "Collapsing/Expanding"}),
}

Mod.registerAction({
    title: "Focus Device Panel*",
    id: 'focus-device-panel',
    description: "Just focus the device panel, rather than the toggle/focus behaviour built into Bitwig.",
    defaultSetting: {
        keys: ['D']
    },
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: 'action',
            data: [
                `focus_or_toggle_detail_editor`,
                `focus_or_toggle_device_panel`
            ]
        })
    }
})

Mod.registerAction({
    title: "Select First Device in Chain",
    id: 'select-first-device-chain',
    description: "Select the first device for the currently selected device chain",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: 'devices/selected/layer/select-first'
        })
    },
    category: categories.selection
})

Mod.registerAction({
    title: "Select Last Device in Chain",
    id: 'select-lirst-device-chain',
    description: "Select the last device for the currently selected device chain",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: 'devices/selected/layer/select-last'
        })
    },
    category: categories.selection
})

Mod.registerAction({
    title: "Select First Device on Track",
    id: 'select-first-device-track',
    description: "Select the first device for the currently selected track",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: 'tracks/selected/devices/select-first'
        })
    },
    category: categories.selection
})

// insertDeviceAtStart: {
//     defaultSetting: {
//         keys: ['Control', 'Q']
//     },
//     action: () => {
//         Bitwig.sendPacket({
//             type: 'devices/selected/chain/insert-at-start'
//         })
//     }
// },
// insertDeviceAtEnd: {
//     defaultSetting: {
//         keys: ['Control', 'E']
//     },
//     action: () => {
//         Bitwig.sendPacket({
//             type: 'devices/selected/chain/insert-at-end'
//         })
//     }
// },

Mod.registerAction({
    title: "Collapse Selected Device",
    id: 'collapse-selected-device',
    description: "Collapses the selected device",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: `devices/selected/collapse`
        })
    },
    category: categories.collapseExpanding
})

Mod.registerAction({
    title: "Expand Selected Device",
    id: 'expand-selected-device',
    description: "Expands the selected device",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: `devices/selected/expand`
        })
    },
    category: categories.collapseExpanding
})

Mod.registerAction({
    title: "Collapse All Devices in Chain",
    id: 'collapse-all-devices-chain',
    description: "Collapses all the devices in the currently active chain",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: `devices/chain/collapse`
        })
    },
    category: categories.collapseExpanding
})

Mod.registerAction({
    title: "Expand All Devices in Chain",
    id: 'expand-all-devices-chain',
    description: "Expands all the devices in the currently active chain",
    contexts: ['-browser'],
    action: () => {
        Bitwig.sendPacket({
            type: `devices/chain/expand`
        })
    },
    category: categories.collapseExpanding
})