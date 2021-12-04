/// <reference path="../lockpick-mod-api.d.ts" />
/**
 * @name Twitch Chat Overlay
 * @id twitch-chat-overlay
 * @description Adds twitch chat as an onscreen overlay
 * @category global
 * @disabled
 */

const chatHeight = 600
const timerHeight = 115

const { ChatClient } = require('dank-twitch-irc')
const showTwitchChat = await Mod.registerSetting({
  id: 'twitch-chat',
  name: 'Show Twitch Chat',
  description: `Whether to show twitch chat overlay`,
})
const showTimer = await Mod.registerSetting({
  id: 'timer',
  name: 'Show Timer',
  description: `Whether to show timer overlay`,
})
showTwitchChat.setValue(true)
showTimer.setValue(true)

const moment = require('moment')
const { w, h } = MainDisplay.getDimensions()

let isFocusMode = false
let chatMessages = []
let client = new ChatClient()
client.on('ready', () => {
  log('Successfully connected to chat')
})

client.on('close', error => {
  if (error != null) {
    log('Client closed due to error', error)
  }
})

const openTimerWithProps = props => {
  if (!showTimer.value) {
    return Popup.closePopup('timer')
  }
  const { w, h } = MainDisplay.getDimensions()
  isFocusMode = props.title === 'focus mode'
  log(props.title)
  Popup.openPopup({
    id: 'timer',
    component: 'Timer',
    persistent: true,
    props,
    rect: {
      x: w - 800,
      y: isFocusMode ? 0 : chatHeight,
      w: 800,
      h: timerHeight,
    },
    clickable: false,
  })
  if (isFocusMode) {
    Popup.closePopup('twitch-chat')
  }
  openCueMarkerPopup()
}

const existingTimer = await getRunningTimer()
isFocusMode = existingTimer?.title === 'focus mode' ?? false
if (existingTimer) {
  openTimerWithProps(existingTimer)
}

const openTwitchChat = () => {
  if (!showTwitchChat.value || isFocusMode) {
    return Popup.closePopup('twitch-chat')
  }
  Popup.openPopup({
    id: 'twitch-chat',
    component: 'TwitchChat',
    props: {
      messages: chatMessages,
    },
    rect: {
      x: w - 800,
      y: 0,
      w: 800,
      h: chatHeight,
    },
    persistent: true,
  })
}

client.on('PRIVMSG', async msg => {
  const { messageText } = msg
  if (messageText.indexOf('!') === 0 && msg.senderUserID === '442061229') {
    if (messageText.indexOf('!timer') === 0) {
      const data = await Db.getCurrentProjectData()
      const parts = messageText.split(' ')
      if (parts[1] === 'stop') {
        await Db.setCurrentProjectData({
          ...data,
          timer: null,
        })
        isFocusMode = false
        openTwitchChat()
        openCueMarkerPopup()
        return Popup.closePopup('timer')
      }
      const targetTime = moment(parts[1], 'h:mma').toDate()
      const title = parts.slice(2).join(' ')
      const props = {
        to: targetTime.getTime(),
        startedAt: new Date().getTime(),
        title,
      }
      openTimerWithProps(props)
      Db.setCurrentProjectData({
        ...data,
        timer: props,
      })
    }
  } else {
    chatMessages.push(_.clone(msg))
    chatMessages = chatMessages.slice(-100)
    openTwitchChat()
  }
})

openTwitchChat()
client.connect()
client.join('theandyshand')

Mod.onExit(() => {
  client.close()
  client.destroy()
  client = null
})

async function getRunningTimer(savedData) {
  if (!savedData) {
    savedData = await Db.getCurrentProjectData()
  }
  return savedData.timer && savedData.timer.to > new Date().getTime() ? savedData.timer : null
}

async function openCueMarkerPopup(savedData) {
  if (!savedData) {
    savedData = await Db.getCurrentProjectData()
  }
  // log(JSON.stringify(savedData.cueMarkers))
  const runningTimer = await getRunningTimer(savedData)
  log(runningTimer)
  // return false
  Popup.openPopup({
    id: 'marker-progress',
    component: 'CueProgress',
    props: {
      ...savedData,
      cueMarkers: Bitwig.cueMarkers.map(marker => {
        const dataForMarker = (savedData.cueMarkers || {})[marker.name]
        if (dataForMarker) {
          marker.data = dataForMarker
        }
        return marker
      }),
    },
    rect: {
      x: w - 800,
      y: (isFocusMode ? 0 : chatHeight) + (runningTimer ? timerHeight : 0),
      w: 800,
      h: 300,
    },
    persistent: true,
  })
}

let lastPosition = -1
let lastMarker = null
let startedPlaying = null

Mod.interceptPacket('transport/play-start', undefined, ({ position }) => {
  lastPosition = position
  // find cue marker for position
  lastMarker = Bitwig.cueMarkers.find((c, i, arr) => {
    const next = arr[i + 1]
    // log(c, lastPosition)
    // Either there isn't a next marker, or we're between this marker and the next one
    return !next || (lastPosition >= c.position && lastPosition < next.position)
  })
  log(lastMarker)
})

Bitwig.on('transportStateChanged', async state => {
  if (state === 'playing') {
    startedPlaying = new Date()
  } else if (startedPlaying && state === 'stopped') {
    const timeSpentPlaying = new Date().getTime() - startedPlaying.getTime()
    const data = await Db.getCurrentProjectData()

    if (lastMarker) {
      if (!data.cueMarkers) {
        data.cueMarkers = {}
      }
      const cueMarkers = data.cueMarkers
      if (!cueMarkers[lastMarker.name]) {
        // Add data for marker if not exist
        cueMarkers[lastMarker.name] = { entries: [] }
      }

      const thisMarkerData = cueMarkers[lastMarker.name]
      const startOfToday = moment().startOf('day').toDate().getTime()
      const findToday = () => thisMarkerData.entries.find(entry => entry.date == startOfToday)

      // Add entry for today if not exist
      if (!findToday()) {
        thisMarkerData.entries.push({
          date: startOfToday,
          duration: 0,
        })
      }

      // Add that amount of time onto todays record for the cue marker we're in
      const todaysEntry = findToday()
      thisMarkerData.duration = (thisMarkerData.duration || 0) + timeSpentPlaying
      todaysEntry.duration += timeSpentPlaying
    }

    // Also add to total amount of project time
    data.totalProjectTime = (data.totalProjectTime || 0) + timeSpentPlaying
    await Db.setCurrentProjectData(data)
    openCueMarkerPopup(data)

    startedPlaying = null
  }
})

Bitwig.on('cueMarkersChanged', () => {
  openCueMarkerPopup()
})

openCueMarkerPopup()

Mod.setInterval(async () => {
  // check timer still needs to be open
  const timer = await getRunningTimer()
  if (!timer) {
    Popup.closePopup('timer')
  }
}, 1000 * 60 * 60)
