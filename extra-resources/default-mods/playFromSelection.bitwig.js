/**
 * @name Play from Selection
 * @id play-from-selection
 * @description Play from the currently selected item (anything that can be used with Bitwig's "Set Arranger Loop").
 * @category arranger
 */

transport.getInPosition().markInterested()
transport.getOutPosition().markInterested()
transport.isPlaying().markInterested()
transport.isArrangerLoopEnabled().markInterested()

const cursorClip = host.createArrangerCursorClip(1, 1)
cursorClip.getPlayStart().markInterested()
cursorClip.getLoopStart().markInterested()
cursorClip.getLoopLength().markInterested()
cursorClip.isLoopEnabled().markInterested()

let startOnMouseDown = 0

function saveLoop() {
    const loopEnabled = transport.isArrangerLoopEnabled().get()
    const currLoopStart = transport.getInPosition().get()
    const currLoopEnd = transport.getOutPosition().get()

    const clipStart = cursorClip.getPlayStart().get()
    const clipLoopStart = cursorClip.getLoopStart().get()
    const clipLoopLength = cursorClip.getLoopLength().get()
    const clipLoopEnabled = cursorClip.isLoopEnabled().get()

    return {
        loopEnabled,
        currLoopStart,
        currLoopEnd,

        clipStart,
        clipLoopStart,
        clipLoopLength,
        clipLoopEnabled
    }
}
function restoreLoop(obj, restoreClip = false) {
    if (!restoreClip) {
        transport.isArrangerLoopEnabled().set(obj.loopEnabled)
        transport.getInPosition().set(obj.currLoopStart)
        transport.getOutPosition().set(obj.currLoopEnd)
    } else {
        cursorClip.getPlayStart().set(obj.clipStart)
        cursorClip.getLoopStart().set(obj.clipLoopStart)
        cursorClip.getLoopLength().set(obj.clipLoopLength)
        cursorClip.isLoopEnabled().set(obj.clipLoopEnabled)
    }
}

packetManager.listen('play-from-selection', (packet) => {
    log('hello!')
    let doIt = () => {
        const saved = saveLoop()
        
        runAction("Loop Selection")
        runAction("jump_to_beginning_of_arranger_loop")
        transport.play()

        setTimeout(() => {
            if (saved.clipLoopStart !== cursorClip.getLoopStart().get() 
            || saved.clipLoopLength !== cursorClip.getLoopLength().get()
            || saved.clipLoopEnabled !== cursorClip.isLoopEnabled().get()) {
                // We were inside the clip view, because the meaning of "Loop Selection" changed to 
                // looping the internal contents of a clip rather in the arranger
    
                showMessage(`"Play From Selection" does not currently support the clip view, sorry!`)
                // transport.playStartPosition().set(saved.clipStart + saved.clipLoopStart)
                // transport.play()
                restoreLoop(saved, true)
            } 
        }, 100)

        restoreLoop(saved)
    }
    if (transport.isPlaying().get()) {
        transport.stop()
        setTimeout(doIt, 100)
    } else {
        doIt()
    }    
})

packetManager.listen('jump-to-playback-start-time', () => {
    runAction('jump_to_playback_start_time')
    if (!transport.isPlaying().get()) {
        transport.play()
    }
})

packetManager.listen('jump-to-playback-start-time-pre-roll', () => {
    const initialPos = transport.playStartPosition().get()
    transport.playStartPosition().set(initialPos - 4)
    runAction('jump_to_playback_start_time')
    if (!transport.isPlaying().get()) {
        transport.play()
    }
    setTimeout(() => {
        transport.playStartPosition().set(initialPos)
    }, 100)
})