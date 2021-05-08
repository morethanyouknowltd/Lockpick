/**
 * @name Automation Area Shortcuts
 * @id automation-area.lockpick
 * @description Adds various shortcuts for showing/hiding automation in the arranger.
 * @category arranger
 * @disabled
 * @creator More Than You Know
 */

let exclusiveAutomation = false
const restoreAutomationAfterDraw = await Mod.registerSetting({
    id: 'restore-automation-after-draw',
    name: 'Restore Automation After Draw',
    description: `Automatically restores automation control after using draw tool`
})

/**
 * Show/Hide Automation
 */
const showHideAutomationCategory = Mod.registerActionCategory({
    title: "Show/Hide Automation",
    description: "Automation shortcuts that behave"
})
async function showAutomationImpl(all, { onlyShow } = { onlyShow: false }) {
    const track = Bitwig.currentTrack.name
    let { automationShown } = await Db.getTrackData(track)
    if (onlyShow && automationShown) {
        return log('Automation already shown')
    }
    log('Showing automation')
    if (exclusiveAutomation && !automationShown) {
        Db.setExistingTracksData({
            automationShown: false
        }, [track])
    }
    await Bitwig.sendPacketPromise({
        type: 'show-automation.automation-area.lockpick',
        data: { all, automationShown, exclusiveAutomation }
    })
    await Db.setTrackData(track, {
        automationShown: !automationShown
    })
}

Mod.registerAction({
    title: "Hide All Automation",
    id: "hide-all-automation.automation-area.lockpick",
    category: showHideAutomationCategory,
    contexts: ['-browser'],
    description: `Hides automation for all tracks in the arranger.`,
    defaultSetting: {
        keys: ["Meta", "Shift", "A"]
    },
    action: () => {
        Db.setExistingTracksData({
            automationShown: false
        })
        Bitwig.makeMainWindowActive()
        Bitwig.sendPacket({ type: 'hide-all-automation.automation-area.lockpick' })
    }
})

Mod.registerAction({
    title: "Show Automation for Current Track",
    id: "show-current-track-automation",
    category: showHideAutomationCategory,
    contexts: ['-browser'],
    description: `Shows automation for the current track in the arranger.`,
    action: showAutomationImpl.bind(null, false, { onlyShow: true })
})

Mod.registerAction({
    title: "Toggle Automation for Current Track",
    id: "show-current-automation.automation-area.lockpick",
    category: showHideAutomationCategory,
    contexts: ['-browser'],
    description: `Toggle automation for current track.`,
    defaultSetting: {
        keys: ["A"]
    },
    action: showAutomationImpl.bind(null, false)
})

Mod.registerAction({
    title: "Toggle All Automation for Current Track",
    id: "show-all-current-automation.automation-area.lockpick",
    category: showHideAutomationCategory,
    contexts: ['-browser'],
    description: `Toggle all automation for current track.`,
    defaultSetting: {
        keys: ["Shift", "A"]
    },
    action: showAutomationImpl.bind(null, true)
})


/**
 * Automation values
 */
const automationPointsCategory = Mod.registerActionCategory({
    title: "Automation Points"
})
for (let i = 0; i < 100; i += 10) {
    Mod.registerAction({
        title: `Set selected automation value to ${i}%`,
        id: `set-automation-${i}%`,
        description: `Requires inspector panel to be open`,
        category: automationPointsCategory,
        subCategory: 0,
        contexts: ['-browser'],
        defaultSetting: {
            keys: ["Shift", `Numpad${String(i)[0]}`]
        },
        action: () => {
            Mod.runAction('set-automation-value')
            setTimeout(async () => {
                // Select all (remove trailing "db")
                Keyboard.keyPress('a', { Meta: true })

                // Type in number
                Keyboard.type(i)

                // Percentage sign
                Keyboard.keyPress('5', { Shift: true })

                await wait(100)
                Keyboard.keyPress('NumpadEnter')
                Mod.setEnteringValue(false)
            }, 200)
        }
    })
}

Mod.registerAction({
    title: `Set selected automation value to 0`,
    id: `set-automation-0`,
    description: `Requires inspector panel to be open`,
    category: automationPointsCategory,
    subCategory: 0,
    contexts: ['-browser'],
    defaultSetting: {
        keys: [`Numpad0`]
    },
    action: () => {
        Mod.runAction('set-automation-value')
        setTimeout(() => {
            // Select all (remove trailing "db")
            Keyboard.keyPress('a', { Meta: true })

            // Type in number
            Keyboard.type('0')

            Keyboard.keyPress('NumpadEnter')
            Mod.setEnteringValue(false)
        }, 100)
    }
})

/**
 * Copying/pasting automation values
 */
for (const dir of ['left', 'right']) {
    const capitalized = dir[0].toUpperCase() + dir.slice(1)
    Mod.registerAction({
        title: `Copy automation value ${dir}`,
        id: `copy-automation-${dir}`,
        contexts: ['-browser'],
        description: `Copies the value of the currently selected automation point to its ${dir}`,
        category: automationPointsCategory,
        subCategory: 1,
        defaultSetting: {
            keys: ["Control", dir === 'left' ? 'Numpad4' : 'Numpad6']
        },
        action: async () => {
            // Incase modifiers are still pressed
            Keyboard.keyUp('Control')

            Mod.runAction('set-automation-value')
            await wait(100)

            // Select all
            Keyboard.keyPress('a', { Meta: true })

            // Copy
            Keyboard.keyPress('c', { Meta: true })

            Keyboard.keyPress('NumpadEnter')

            // Focus arranger
            Mod.runAction('focus-arranger')

            // Move to left/right automation point
            Keyboard.keyPress(`Arrow${capitalized}`)

            // Must reset enteringValue for set-automation-value to trigger
            // (see implementation)
            Mod.setEnteringValue(false)
            Mod.runAction('set-automation-value')

            await wait(100)
            // Select all
            Keyboard.keyPress('a', { Meta: true })

            // Paste
            Keyboard.keyPress('v', { Meta: true })

            // Confirm
            Keyboard.keyPress('NumpadEnter')
            Mod.setEnteringValue(false)

            // Focus arranger
            Mod.runAction('focus-arranger')
        }
    })
}

Mod.registerAction({
    title: `Copy automation value`,
    id: `copy-automation-value`,
    description: `Copies the value of the currently selected automation`,
    category: automationPointsCategory,
    subCategory: 1,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Meta", "Shift", "C"]
    },
    action: async () => {
        Mod.runAction('set-automation-value')
        Keyboard.keyPress('c', { Meta: true })
        Keyboard.keyPress('NumpadEnter')
        Mod.setEnteringValue(false)
        Mod.runAction('focus-arranger')
    }
})

Mod.registerAction({
    title: `Paste automation value`,
    id: `paste-automation-value`,
    description: `Pastes the value of the currently selected automation`,
    category: automationPointsCategory,
    subCategory: 1,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Meta", "Shift", "V"]
    },
    action: async () => {
        Mod.runAction('set-automation-value')
        Keyboard.keyPress('v', { Meta: true })
        Keyboard.keyPress('NumpadEnter')
        Mod.setEnteringValue(false)
        Mod.runAction('focus-arranger')
    }
})

Mod.registerAction({
    id: 'set-automation-value',
    defaultSetting: {
        keys: ['NumpadEnter']
    },
    contexts: ['-browser'],
    category: automationPointsCategory,
    subCategory: 2,
    description: 'Focuses the automation value field in the inspector for quickly setting value of selected automation.',
    action: async () => {
        Mod.runAction('focus-arranger')
        const uiLayout = UI.MainWindow.getLayoutState()
        if (uiLayout.inspector) {
            // showMessage(JSON.stringify(uiLayout.inspector))
            await Mouse.click(0, {
                x: uiLayout.inspector.rect.x + UI.scale(100),
                y: uiLayout.inspector.rect.y + UI.scale(60),
                Meta: true,
                returnAfter: true
            })
            Mod.setEnteringValue(true)
        } else {
            showMessage('Inspector not open')
        }
    }
})

Mod.registerAction({
    id: 'set-automation-position',
    defaultSetting: {
        keys: ['Control', 'NumpadEnter']
    },
    contexts: ['-browser'],
    category: automationPointsCategory,
    subCategory: 2,
    description: 'Focuses the automation position field in the inspector for quickly setting position of selected automation.',
    action: async () => {
        Mod.runAction('focus-arranger')
        await Mouse.click(0, UI.bwToScreen({
            x: 140,
            y: 120,
            Meta: true,
            returnAfter: true
        }))
        Mod.setEnteringValue(true)
    }
})

Mod.registerAction({
    title: `Snap automation to nearest bar`,
    id: `snap-automation-nearest-bar`,
    description: `Rounds the position of the selected automation point to the nearest bar`,
    category: automationPointsCategory,
    subCategory: 1,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Control", 'Numpad5']
    },
    action: async () => {
        // Incase modifiers are still pressed, they prevent
        // the value from being set for some reason
        Keyboard.keyUp('Control')

        Mod.runAction('set-automation-position')
        await wait(100)

        // Copy
        Keyboard.keyPress('c', { Meta: true })

        // Wait a little to ensure clipboard is populated
        await wait(100)

        const position = Mod.getClipboard()
        let beats = parseInt(position.split('.')[0], 10)

        const rest = position.split('.').slice(1)
        if (rest[0] === '1' || rest[0] === '2') {
            // Round down
        } else {
            // Round up
            beats += 1
        }

        const toType = beats + '.1.1.00'

        Keyboard.type(toType)
        Keyboard.keyPress('NumpadEnter')

        Mod.setEnteringValue(false)
        log(`Set automation point to ${toType}`)
    }
})

async function openAutomationForTrack(targetT) {
    const clickAt = targetT.isLargeTrackHeight ? {
        x: targetT.rect.x + targetT.rect.w - UI.scale(26),
        y: targetT.rect.y + UI.scale(36),
    } : {
        x: targetT.rect.x + targetT.rect.w - UI.scale(44),
        y: targetT.rect.y + UI.scale(7),
    }
    await Mouse.click(0, {
        ...clickAt,
        avoidPluginWindows: true,
        returnAfter: true
    })
    Db.setCurrentTrackData({
        automationShown: true
    })
}

/**
 * Volume automation
 */
const volumeAutomationCategory = Mod.registerActionCategory({
    title: "Volume automation"
})
async function showTrackVolumeAutomation(currentTrack) {
    const tracks = UI.MainWindow.getArrangerTracks()
    if (tracks === null || tracks.length === 0) {
        return log('No tracks found, spoopy...')
    }

    const mousePos = Mouse.getPosition()
    const getTargetTrack = () => {
        if (currentTrack) {
            return tracks.find(t => t.selected)
        } else {
            return tracks.find(t => mousePos.y >= t.rect.y && mousePos.y < t.rect.y + t.rect.h)
        }
    }
    const targetT = getTargetTrack()
    if (!targetT) {
        return showMessage(`Couldn't find track`)
    }
    log(targetT)

    if (!targetT.selected) {
        await targetT.selectWithMouse()
    }

    const clickAt = targetT.isLargeTrackHeight ? {
        // Level meter is halfway across near the bottom
        x: targetT.rect.x + (targetT.rect.w / 2),
        y: targetT.rect.y + UI.scale(33),
    } : {
        // Level meter is on the right hand edge from top to bottom
        x: (targetT.rect.x + targetT.rect.w) - UI.scale(25),
        y: targetT.rect.y + UI.scale(15),
    }

    log('Clicking at: ', clickAt)
    await Mouse.click(0, {
        ...clickAt,
        avoidPluginWindows: true,
        // For whatever reason the click here happens after returning the mouse,
        // so we need to wait a little. So many timeouts :(
        returnAfter: true
    })
    if (!targetT.automationOpen) {
        openAutomationForTrack(targetT)
    }
}

Mod.registerAction({
    title: `Show hovered track volume automation`,
    id: `show-track-volume-automation`,
    description: `Selects the track volume and opens automation if it isn't open already`,
    category: volumeAutomationCategory,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["V"]
    },
    action: async () => {
        showTrackVolumeAutomation(false)
    }
})

Mod.registerAction({
    title: `Show selected track volume automation`,
    id: `show-selected-track-volume-automation`,
    description: `Selects the track volume and opens automation if it isn't open already`,
    category: volumeAutomationCategory,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Shift", "V"]
    },
    action: async () => {
        showTrackVolumeAutomation(true)
    }
})

Mod.registerAction({
    title: `Toggle automation for hovered track`,
    id: `toggle-hovered-track-automation`,
    description: `Toggles the automation section for the currently hovered over track`,
    category: volumeAutomationCategory,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Shift", "A"]
    },
    action: async () => {
        const tracks = UI.MainWindow.getArrangerTracks()
        if (tracks === null || tracks.length === 0) {
            return log('No tracks found, spoopy...')
        }

        const mousePos = Mouse.getPosition()
        const getTargetTrack = () => {
            return tracks.find(t => mousePos.y >= t.rect.y && mousePos.y < t.rect.y + t.rect.h)
        }
        const targetT = getTargetTrack()
        if (!targetT) {
            return showMessage(`Couldn't find track`)
        }

        openAutomationForTrack(targetT)
    }
})


// Always restore automation control when 3 is pressed and mousedown (drawing automation)
Mouse.on('mouseup', event => {
    if (!Bitwig.connected) {
        return
    }
    if (restoreAutomationAfterDraw.value && event.button === 0 && UI.activeTool === 3) {
        Bitwig.sendPacket({ type: 'action', data: 'restore_automation_control' })
    }
})

// Quickly create adjacent automation points with mouse button 3
// Mouse.on('mousedown', whenActiveListener(event => {
//     if (event.button === 3 && event.Shift) {
//         Mouse.returnAfter(() => {
//             const { x, y } = Mouse.getPosition()
//             if (event.Meta) {
//                 Mouse.doubleClick(0, {x, y, Shift: true})
//                 Mouse.doubleClick(0, {x: x + 8, y, Shift: true})
//             } else {
//                 Mouse.click(0, {x, y, Shift: true})
//                 Mouse.click(0, {x: x + 8, y, Shift: true})
//             }
//         })
//     }
// }))