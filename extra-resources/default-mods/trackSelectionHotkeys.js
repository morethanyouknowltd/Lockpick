/// <reference path="../lockpick-mod-api.d.ts" />
/**
 * @name Track Selection Hotkeys
 * @id track-selection-hotkeys
 * @description Provides shortcuts for navigating between tracks.
 * @category global
 */

/**
 * TRACK NUMPAD
 */

const NUM_HOTKEYS = 10
let lastTracksByName = {}
let lastLoadI = -1
let lastLoaded = new Date(0)

const categories = {
  numpad: Mod.registerActionCategory({ title: 'Track Numpad Selection' }),
  history: Mod.registerActionCategory({ title: 'Track Back/Forward' }),
}

// async function highlightNumber(key, context, projectData) {
//     if (Bitwig.tracks.length === 0) {
//         await Bitwig.sendPacketPromise({type: 'track-selection-hotkeys/send-tracks'})
//     } else {
//         Bitwig.sendPacketPromise({type: 'track-selection-hotkeys/send-tracks'})
//     }
//     const tracksByName = {...lastTracksByName, ..._.indexBy(Bitwig.tracks, 'name')}
//     lastTracksByName = tracksByName

//     let keys = []
//     for (let i = 1; i <= 9; i++) {
//         keys.push({
//             key: `Numpad${i}`,
//             track: tracksByName[projectData[i - 1]]
//         })
//     }
//     Mod._openFloatingWindow(`/numpad`, {
//         data: {
//             keys,
//             key: context.keyState.keys.find(key => key.indexOf('Numpad') == 0)
//         },
//         width: 528,
//         height: 720,
//         timeout: 1000
//     })
// }

// for (let i = 0; i < NUM_HOTKEYS; i++) {
//     Mod.registerAction({
//         title: `Save track for hotkey ${i + 1}`,
//         id: `save-track-hotkey-${i + 1}`,
//         category: categories.numpad,
//         description: `Save track for recall using the set hotkey ${i + 1}.`,
//         defaultSetting: {
//             // 1, 2, 3...0
//             keys: ["Alt", "Shift", String(i + 1).slice(-1)]
//         },
//         action: async (context) => {
//             if (!Bitwig.currentTrack) {
//                 Bitwig.showMessage(`No track selected.`)
//                 return
//             }
//             const projectData = await Db.getCurrentProjectData()
//             const newProjectData = {
//                 ...projectData,
//                 [i]: Bitwig.currentTrack
//             }
//             await Db.setCurrentProjectData(newProjectData)
//             highlightNumber(i + 1, context, newProjectData)
//         }
//     })

//     Mod.registerAction({
//         title: `Load track for hotkey ${i + 1}`,
//         id: `load-track-hotkey-${i + 1}`,
//         category: categories.numpad,
//         description: `Select track previous set for hotkey ${i + 1}.`,
//         defaultSetting: {
//             keys: ["Shift", String(i + 1).slice(-1)]
//         },
//         action: async (context) => {
//             const projectData = await Db.getCurrentProjectData()
//             highlightNumber(i + 1, context, projectData)
//             const track = projectData[i]
//             if (track) {
//                 if (lastLoadI === i && new Date().getTime() - lastLoaded.getTime() < 250) {
//                     // Enter group on double tap
//                     Bitwig.sendPacket({type: 'track/select', data: { name: track, allowExitGroup: true, enter: true }})
//                 } else {
//                     Bitwig.sendPacket({type: 'track/select', data: { name: track, allowExitGroup: true }})
//                 }
//             }
//             lastLoadI = i
//             lastLoaded = new Date()
//         }
//     })
// }

/**
 * TRACK BACK/FORWARD
 */
trackHistory = []
historyIndex = -1
ignoreSelectionChangesCount = 0

Bitwig.on('selectedTrackChanged', curr => {
  // if (Controller.get(TrackSearchController).active) {
  //     // Don't record track changes whilst highlighting search results
  //     return
  // }
  const name = curr.name

  if (name.trim().length == 0 || ignoreSelectionChangesCount > 0) {
    ignoreSelectionChangesCount--
    return
  }

  trackHistory = trackHistory.slice(0, historyIndex + 1)
  trackHistory.push(curr)
  historyIndex++

  // Make sure history doesn't exceed max items
  while (trackHistory.length > 10) {
    trackHistory.splice(0, 1)
    historyIndex--
  }
})

for (const dir of ['Previous', 'Next']) {
  Mod.registerAction({
    title: `Go to ${dir} Track`,
    id: `go-to-${dir.toLowerCase()}-track`,
    category: categories.history,
    description: `Go to the ${dir.toLowerCase()} track in the track history. Currently doesn't support nested return tracks.`,
    action: async () => {
      if (dir === 'Previous') {
        if (historyIndex > 0) {
          ignoreSelectionChangesCount++
          historyIndex--
          const name = trackHistory[historyIndex].name
          Bitwig.sendPacket({ type: 'track/select', data: { name, allowExitGroup: true } })
        }
      } else {
        if (historyIndex < trackHistory.length - 1) {
          ignoreSelectionChangesCount++
          historyIndex++
          const name = trackHistory[historyIndex].name
          Bitwig.sendPacket({ type: 'track/select', data: { name, allowExitGroup: true } })
        }
      }
      const dim = MainDisplay.getDimensions()
      if (trackHistory.length > 1) {
        Popup.openPopup({
          id: 'trackHistory',
          component: 'TrackHistoryPopup',
          props: {
            history: trackHistory,
            index: historyIndex,
          },
          rect: {
            x: 0,
            y: 0,
            w: dim.w,
            h: dim.h,
          },
          timeout: 800,
          clickable: false,
        })
      }
    },
  })
}
