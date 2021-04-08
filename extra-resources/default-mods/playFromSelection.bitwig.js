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

let startOnMouseDown = 0

function saveLoop() {
    const loopEnabled = transport.isArrangerLoopEnabled().get()
    const currLoopStart = transport.getInPosition().get()
    const currLoopEnd = transport.getOutPosition().get()
    return {
        loopEnabled,
        currLoopStart,
        currLoopEnd
    }
}
function restoreLoop(obj) {
    transport.isArrangerLoopEnabled().set(obj.loopEnabled)
    transport.getInPosition().set(obj.currLoopStart)
    transport.getOutPosition().set(obj.currLoopEnd)
}

packetManager.listen('play-from-selection', (packet) => {
    if (packet.data) {
        // Support for clicking to set playhead 
        if (transport.isPlaying().get()) {
            return
        }

        let mouseup = packet.data.mouseup
        let mousedown = packet.data.mousedown

        if (mousedown) {
            startOnMouseDown = transport.playStartPosition().get()
        } else if (mouseup) {
            setTimeout(() => {
                const startNow = transport.playStartPosition().get()
                if (startNow === startOnMouseDown) {
                    // The user didn't do something to change transport, try changing it to selected item
                    const saved = saveLoop()
                    runAction("Loop Selection")
                    runAction("jump_to_beginning_of_arranger_loop")
                    
                    setTimeout(() => {
                        if (transport.playStartPosition().get() === 0) {
                            // There was nothing selected, revert!
                            transport.playStartPosition().set(startNow)
                        }
                    }, 100)
                    restoreLoop(saved)
                }
            }, 0)
        }
    } else {
        let doIt = () => {
            const saved = saveLoop()
            
            runAction("Loop Selection")
            runAction("jump_to_beginning_of_arranger_loop")
            transport.play()
            
            restoreLoop(saved)
        }
        if (transport.isPlaying().get()) {
            transport.stop()
            setTimeout(doIt, 100)
        } else {
            doIt()
        }
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