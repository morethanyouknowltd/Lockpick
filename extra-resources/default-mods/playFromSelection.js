/**
 * @name Play from Selection
 * @id play-from-selection
 * @description Play from the currently selected item (anything that can be used with Bitwig's "Set Arranger Loop").
 * @category arranger
 */

Mod.registerAction({
    title: "Play from Selection",
    id: "play-from-selection",
    category: "arranger",
    description: `Play from the currently selected item (anything that can be used with Bitwig's "Set Arranger Loop")`,
    defaultSetting: {
        keys: ["Shift", "Space"]
    },
    action: () => Bitwig.sendPacket({type: 'play-from-selection'})
})

Mod.registerAction({
    title: "Jump to Playback Start Time",
    id: "jump-to-playback-start-time",
    category: "arranger",
    defaultSetting: {
        keys: ["Alt", "Space"]
    },
    action: () => Bitwig.sendPacket({type: 'jump-to-playback-start-time'})
})

Mod.registerAction({
    title: "Jump to Playback Start Time (Pre-roll)",
    id: "jump-to-playback-start-time-pre-roll",
    category: "arranger",
    defaultSetting: {
        keys: ["Control", "Shift", "Space"]
    },
    action: () => Bitwig.sendPacket({type: 'jump-to-playback-start-time-pre-roll'})
})

let numDownBefore = null
const normalClickToo = false

Keyboard.on('keydown', event => {
    const { lowerKey } = event
    // restore tools after middle click + 1 timeline
    let num = parseInt(lowerKey, 10)
    if (num > 1 && num <= 5) {
        numDownBefore = num
    }
})

Keyboard.on('keyup', event => {
    const { lowerKey } = event
    let num = parseInt(lowerKey, 10)
    if (num === numDownBefore) {
        numDownBefore = null
    }
})

function playWithEvent(event) {
    // log(uiLayout)
    const mousePosBefore = Mouse.getPosition()
    if (numDownBefore) {
        Keyboard.keyUp(String(numDownBefore))
    }
    
    const getClickPos = () => {
        if (UI.screenshotsEnabled) {
            const uiLayout = UI.MainWindow.getLayoutState()
            if (uiLayout.arranger && Rect.containsPoint(uiLayout.arranger.rect, mousePosBefore)) {
                // Arranger panel
                return {
                    x: event.x, 
                    y: uiLayout.arranger.rect.y + UI.scale(8)
                }
            } else if (uiLayout.editor?.type === 'detail' && Rect.containsPoint(uiLayout.editor.rect, mousePosBefore)) {
                // Detail panel
                return {
                    x: event.x, 
                    y: uiLayout.editor.rect.y + UI.scale(8)
                }
            } else {
                // Elsewhere, do nothing
                return null
            }
        } else {
            return {
                x: event.x,
                y: UI.MainWindow.getFrame().y + UI.scale(96)
            }
        }
    }
    
    const timelineClickPosition = getClickPos()
    if (!timelineClickPosition) {
        return
    }

    const doTheClick = () => {
        if (normalClickToo) {
            Keyboard.keyDown('2')
            Mouse.click(0, {
                ...event,
                lockpickListeners: true // Means we can still run our track selection logic
            })
            Keyboard.keyUp('2')
        }
        Keyboard.keyDown('1')
        Mouse.doubleClick(0, {...event, ...timelineClickPosition})
        Mouse.setPosition(mousePosBefore.x, mousePosBefore.y)
        Keyboard.keyUp('1')
        if (numDownBefore) {
            Keyboard.keyDown(String(numDownBefore))
        }
    }

    if (!Bitwig.intersectsPluginWindows(timelineClickPosition)) {
        log(`Double-clicking time ruler at ${timelineClickPosition.x}, ${timelineClickPosition.y}`)
        // Pass modifiers 
        doTheClick()
    } else {
        const pluginPositions = Bitwig.getPluginWindowsPosition()
        Mod.runAction(`move-plugin-windows-offscreen`, { forceState: 'bottomright' })
        setTimeout(() => {
            doTheClick()
            Bitwig.setPluginWindowsPosition(pluginPositions)
        }, 100)
    }
}

Mod.registerAction({
    id: 'play-from-cursor-position',
    title: "Play from Cursor Position",
    description: "Double-clicks the arranger ruler at the X position of the mouse cursor",
    action: () => {
        playWithEvent({x: Mouse.getPosition().x})
    }
})