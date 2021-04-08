/**
 * @name Middle-Click Play
 * @id middle-click-play
 * @description Middle click anywhere within the arranger timeline to play from that point. Click the dividing line between the arranger and note editor while holding 'Shift+E' to work in note editor too.
 * @category arranger
 * @disabled
 */

let playButtonDown = false
let clickButton = 4
let startPos = ''
let startPosObj
const makePos = event => JSON.stringify({x: event.x, y: event.y})
let downTime = new Date(0)
let editorIsProbablyOpen = false
let editorBorderLineY = 9999
let draggingBorderLine = false
let shiftEDown = false

let numDownBefore = null
const normalClickToo = false

Keyboard.on('keydown', event => {
    const { lowerKey, Shift } = event
    shiftEDown = Shift && lowerKey === 'e'

    // restore tools after middle click + 1 timeline
    let num = parseInt(lowerKey, 10)
    if (num > 1 && num <= 5) {
        numDownBefore = num
    }
})

Keyboard.on('keyup', event => {
    const { lowerKey } = event
    shiftEDown = false
    if (lowerKey === 'd') {
        editorIsProbablyOpen = false
    } else if (lowerKey === 'e') {
        editorIsProbablyOpen = true
    }
    let num = parseInt(lowerKey, 10)
    if (num === numDownBefore) {
        numDownBefore = null
    }
})

function playWithEvent(event) {
    const uiLayout = UI.MainWindow.getLayoutState()
    // log(uiLayout)
    const mousePosBefore = Mouse.getPosition()
    if (numDownBefore) {
        Keyboard.keyUp(String(numDownBefore))
    }

    const getClickPos = () => {
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

let timeSelecting = false
Mouse.on('mousedown', event => {
    const isActive = Bitwig.isActiveApplication()

    if (event.button === 3 && isActive && !event.intersectsPluginWindows()) {
        // Button 3 click time select. Still have to click, but is like pressing 2
        timeSelecting = true
        const doIt = () => {
            Mouse.up(3)
            Keyboard.keyDown("2")
        }
        if (Bitwig.isPluginWindowActive) {
            Bitwig.makeMainWindowActive()    
            setTimeout(doIt, 100)
        } else {
            doIt()
        }   
        return
    }

    playButtonDown = isActive && event.button === clickButton
    if (playButtonDown && clickButton !== 1) {
        // If click button isn't middle click, we can trigger play straight away as these buttons have no extra function in Bitwig
        return playWithEvent(event)
    }
    startPosObj = {
        x: event.x,
        y: event.y
    }
    startPos = makePos(event)
    downTime = new Date()

    draggingBorderLine = !playButtonDown && isActive && Math.abs(event.y - editorBorderLineY) < 10
})

Mouse.on('mouseup', event => {
    if (timeSelecting && event.button === 3) {
        Keyboard.keyUp("2")
        timeSelecting = false
        return
    }

    if (draggingBorderLine || shiftEDown) {
        // Mouse up from dragging border line or manually setting it with 'e' key
        editorBorderLineY = event.y
        Bitwig.showMessage(`Set editor border Y to: ${event.y}px`)
        editorIsProbablyOpen = true
    } else {
        let timeDifference = new Date().getTime() - downTime.getTime()
        if (playButtonDown && makePos(event) === startPos && timeDifference < 200 && clickButton === 1) {
            playWithEvent(event)
        }
    }
    playButtonDown = false
})