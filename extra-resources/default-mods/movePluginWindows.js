/**
 * @name Manage Plugin Windows
 * @id move-plugin-windows
 * @description Adds several actions for manipulating the positions of plugin windows
 * @category devices
 */

const settings = {
    middleClickToDrag: await Mod.registerSetting({
        id: 'middle-click-to-drag',
        name: 'Middle-click drags plugin windows',
        description: `Hold middle click over any plugin windows to quickly drag it around`
    }),
    showPluginLabels: await Mod.registerSetting({
        id: 'show-plugin-labels',
        name: `Show Plugin Labels`,
        description: `Show labels on plugin windows when moving`
    })
}

const categories = {
    moving: Mod.registerActionCategory({title: "Moving Windows"}),
    openingClosing: Mod.registerActionCategory({title: "Opening/Closing"})
}

const repositionLabels = () => {
    if (!settings.showPluginLabels.value) {
        return
    }
    Popup.closeAll()
    const positions = Object.values(Bitwig.getPluginWindowsPosition())
    if (positions.length === 0) {
        return
    }
    const sharedStart = (array) => {
        var A= array.concat().sort(), 
        a1= A[0], a2= A[A.length-1], L= a1.length, i= 0;
        while(i<L && a1.charAt(i)=== a2.charAt(i)) i++;
        return a1.substring(0, i);
    }
    let inCommon = positions.length === 1 ? '' : sharedStart(positions.map(p => p.id))
    if (positions.length === 1) {
        inCommon = positions[0].id.split(' / ').slice(-3).join(' / ')
    }
    const takeOffLastAndRemoveDuplicates = str => {
        const parts = str.split(' / ')
        if (parts.length === 1) {
            return str
        }
        return _.uniq(parts.slice(0, parts.length - 1)).join(' / ')
    }
    for (const window of positions) {
        Popup.openPopup({
            id: window.id,
            component: 'PluginWindowWrap',
            props: {
                content: takeOffLastAndRemoveDuplicates(positions.length === 1 ? inCommon : window.id.substr(inCommon.length))
            },
            rect: window,
            clickable: false,
            timeout: 2000
        })
    }
}

Mod.registerAction({
    title: "Show Plugin Window Labels",
    id: "show-plugin-window-labels",
    description: `Shows labels to easily identify plugin windows`,
    action: () => {
        repositionLabels()
    }
})

Mod.registerAction({
    id: 'close-plugin-windows',
    description: "Closes all currently open plugin windows",
    category: categories.openingClosing,
    defaultSetting: {
        keys: ['Escape'],
        doubleTap: true
    },
    action: () =>  Bitwig.closeFloatingWindows()
})

Mod.registerAction({
    title: "Move Plugin Windows To Corner",
    id: "move-plugin-windows-offscreen",
    category: categories.moving,
    description: `Moves plugin windows out of the way to the corner of the screen, remembering their location for later restoration. Alternates between top right and bottom right corner.`,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Escape"]
    },
    action: async ({forceState} = {}) => {
        const {
            state,
            positions
        } = await Db.getCurrentTrackData()
        let newState = forceState ? forceState : (state === 'topright' ? 'bottomright' : 'topright')

        const pluginWindows = Bitwig.getPluginWindowsPosition()
        Db.setCurrentTrackData({
            // Only save current positions if we went from onscreen to offscreen
            positions: state === 'onscreen' ? pluginWindows : positions,
            state: newState
        })

        const mainWindowFrame = MainDisplay.getDimensions()
        const offscreenPositions = Object.values(pluginWindows).map(info => {
            return {
                id: info.id,
                x: mainWindowFrame.w - info.w,
                y: newState === 'bottomright' ? mainWindowFrame.h - info.h : 0
            }
        })

        Bitwig.setPluginWindowsPosition(_.indexBy(offscreenPositions, 'id'))
        Popup.closeAll()
    }
})

Mod.registerAction({
    title: "Restore Plugin Windows From Corner",
    id: "restore-plugin-windows-onscreen",
    category: categories.moving,
    description: `Restores the position of plugin windows previously moved to the corner.`,
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["F1"]
    },
    action: async () => {
        const { positions, state } = await Db.getCurrentTrackData()
        if (!positions) {
            return Bitwig.showMessage('No position data saved')
        } 
        Bitwig.setPluginWindowsPosition(positions)
        Db.setCurrentTrackData({
            positions,
            state: 'onscreen'
        })
        repositionLabels()
    }
})

Mod.registerAction({
    title: "Tile Plugin Windows",
    id: "tile-plugin-windows",
    contexts: ['-browser'],
    category: categories.moving,
    description: `Tile plugin windows in the center of the arranger.`,
    defaultSetting: {
        keys: ["F2"]
    },
    action: () => {        
        const pluginWindows = Object.values(Bitwig.getPluginWindowsPosition()).sort((a, b) => a.id < b.id ? -1 : 1)
        if (pluginWindows.length === 0) {
            return
        }

        const display = MainDisplay.getDimensions()
        const startX = 500;
        const finalPositions = {}

        if (pluginWindows.length === 1) {
            // If just one window, put it right in the center
            const window = pluginWindows[0]
            finalPositions[pluginWindows[0].id] = {
                x: display.w * .5 - window.w / 2,
                y: display.h * .43 - window.h / 2
            }
        } else {
            let x = startX, y = 0;
            let nextRowY = y;
            let out = []

    
            for (const window of pluginWindows) {
                if (x + window.w > display.w) {
                    // next row
                    x = startX;
                    y = nextRowY;
                }
    
                out.push({
                    id: window.id,
                    x,
                    y,
                    // needed for maxX/maxY
                    w: window.w,
                    h: window.h
                })
                
                x += window.w;
                nextRowY = Math.max(nextRowY, y + window.h);
            }
    
            const maxX = Math.max.apply(null, out.map(pos => pos.x + pos.w))
            const maxY = Math.max.apply(null, out.map(pos => pos.y + pos.h))
    
            const offsetX = (display.w - maxX) / 2
            const offsetY = (display.h - maxY) / 2
            for (const pos of out) {
                finalPositions[pos.id] = {
                    x: pos.x,
                    y: pos.y + offsetY
                }
            }
        }

        Bitwig.setPluginWindowsPosition(finalPositions)
        Db.setCurrentTrackData({
            positions: finalPositions,
            state: 'onscreen'
        })
        repositionLabels()
    }
})

let downEvent = null
let draggingWindowId = null
let initialPositions = {}

Mouse.on('mousedown', event => {
    if (!settings.middleClickToDrag.value) {
        return
    }
    Popup.closeAll()
    if (event.button !== 1) {
        return
    }
    const pluginWindowHit = event.intersectsPluginWindows()
    if (pluginWindowHit) {
        draggingWindowId = pluginWindowHit.id
        initialPositions = Bitwig.getPluginWindowsPosition()
        downEvent = event
    }
})

Mouse.on('mouseup', event => {
    if (!settings.middleClickToDrag.value) {
        return
    }
    if (draggingWindowId) {
        let pos = initialPositions[draggingWindowId]
        initialPositions[draggingWindowId] = {
            ...pos,
            x: pos.x + event.x - downEvent.x,
            y: pos.y + event.y - downEvent.y
        }
        Bitwig.setPluginWindowsPosition(initialPositions)
        repositionLabels()
    }
    downEvent = null
    draggingWindowId = null
    initialPositions = {}
})