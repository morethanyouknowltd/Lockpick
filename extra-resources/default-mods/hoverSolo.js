/**
 * @name Hover Solo
 * @id hover-solo
 * @description Allows mouse button 4 to be used to toggle solo for a specific track
 * @category arranger
 * @disabled
 */

let downAt = null
let lastTracks = null
// Keep track of which track we soloed
let soloedIndex = -1
let pauseMouseMove = false
let isMute = false

function trackIndexForEvent(mousePositionXY) {
    if (!lastTracks) {
        lastTracks = UI.MainWindow.getArrangerTracks() || []
    }
    return lastTracks.findIndex(t => mousePositionXY.y >= t.rect.y && mousePositionXY.y < t.rect.y + t.rect.h) 
}

Mod.registerAction({
    title: `Solo hovered track`,
    id: `solo-hovered-track`,
    description: `Solos the track the mouse cursor is currently over`,
    category: 'arranger',
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Alt", "S"]
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
        log(targetT)

        const clickAt = targetT.isLargeTrackHeight ? {
            x: targetT.rect.x + targetT.rect.w - UI.scale(54),
            y: targetT.rect.y + UI.scale(10),
        } : {
            x: targetT.rect.x + targetT.rect.w - UI.scale(90),
            y: targetT.rect.y + UI.scale(7),
        }
        await Mouse.click(0, {
            ...clickAt,
            avoidPluginWindows: true,
            returnAfter: true
        })
    }
})

Mod.registerAction({
    title: `Mute hovered track`,
    id: `mute-hovered-track`,
    description: `Mutes the track the mouse cursor is currently over`,
    category: 'arranger',
    contexts: ['-browser'],
    defaultSetting: {
        keys: ["Shift", "M"]
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
        log(targetT)

        const clickAt = targetT.isLargeTrackHeight ? {
            x: targetT.rect.x + targetT.rect.w - UI.scale(30),
            y: targetT.rect.y + UI.scale(10),
        } : {
            x: targetT.rect.x + targetT.rect.w - UI.scale(60),
            y: targetT.rect.y + UI.scale(7),
        }
        await Mouse.click(0, {
            ...clickAt,
            avoidPluginWindows: true,
            returnAfter: true
        })
    }
})

async function toggleSolo(index, opts = {}) {
    const targetT = lastTracks[index]
    if (!targetT) {
        return showMessage(`Couldn't find track`)
    }    
    const clickAt = targetT.isLargeTrackHeight ? {
        x: targetT.rect.x + targetT.rect.w - UI.scale(isMute ? 30 : 54), 
        y: targetT.rect.y + UI.scale(10),
    } : {
        x: targetT.rect.x + targetT.rect.w - UI.scale(isMute ? 60 : 90), 
        y: targetT.rect.y + UI.scale(7),
    }        
    if (index === soloedIndex) {
        Popup.closeAll()
        const state = UI.MainWindow.getLayoutState()
        Popup.openPopup({
            id: 'muteorsolo',
            component: 'TrackOverlay',
            props: {
                content: isMute ? 'Muted' : 'Soloed'
            },
            rect: {
                x: targetT.rect.x + targetT.rect.w,
                y: targetT.rect.y,
                w: state.arranger.rect.w - targetT.rect.w,
                h: targetT.rect.h
            },
            clickable: false
        })
    }

    await Mouse.click(0, {
        ...clickAt,
        avoidPluginWindows: true,
        returnAfter: 100,
        ...opts
    })
    return true
}

Mouse.on('scroll', event => {
    if (downAt) {
        lastTracks = null
        Bitwig.runAction('clear_solo')
        soloedIndex = -1
        pauseMouseMove = true
        setTimeout(() => {
            pauseMouseMove = false    
        }, 250)
    }
})

Mouse.on('mousedown', async event => {
    // log('mousedown', event)
    if (event.button === 3 && (event.noModifiers() || event.Alt) && !event.intersectsPluginWindows()) {
        const trackIndex = trackIndexForEvent(event)
        // log(lastTracks, trackIndex)
        // showMessage(`Soloing track index ${trackIndex}`)
        if (lastTracks[trackIndex]) {
            downAt = new Date()
            soloedIndex = trackIndex
            isMute = event.Alt
            await toggleSolo(trackIndex)
            log('soloed')
        }
    }    
})

Mouse.on('mousemove', debounce(async event => {
    if (downAt && !pauseMouseMove) {
        const index = trackIndexForEvent(event)
        // log('mousemove')
        if (index !== soloedIndex) {
            pauseMouseMove = true
            let oldIndex = soloedIndex
            soloedIndex = index
            const pos = Mouse.getPosition()
            await toggleSolo(index, { returnAfter: false })
            await toggleSolo(oldIndex, { returnAfter: false })
            Mouse.setPosition(pos.x, pos.y)
            pauseMouseMove = false
        }
    }
}, 50))
    
Mouse.on('mouseup', async event => {
    // log('mouseup', event)
    if (event.button === 3 && lastTracks) {
        // We held click for a while, unsolo the previously solo'd track
        const timeDif = new Date() - downAt
        const soloed = lastTracks[soloedIndex]
        if (!soloed.selected) {
            await soloed.selectWithMouse()
        }
        if (timeDif > 500 && soloedIndex >= 0) {
            if (isMute) {
                toggleSolo(soloedIndex)
            } else {
                // toggleSolo(soloedIndex)
                Bitwig.runAction('clear_solo')
            }
        }

        lastTracks = null
        soloedIndex = -1
        downAt = null
        Popup.closeAll()
    }
})