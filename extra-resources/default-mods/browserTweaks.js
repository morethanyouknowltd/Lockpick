/// <reference path="../lockpick-mod-api.d.ts" />

/**
 * @name Browser Shortcuts
 * @description Adds better shortcuts for opening browser, switching tabs and confirming choice.
 * @id browser-tweaks
 * @category browser
 */

let modulatorsOpen = false
let browserOpenAt = new Date(0)
let browserTextIsh = ''

Keyboard.on('keydown', event => {
  const { lowerKey } = event
  if (Bitwig.isBrowserOpen && /^[a-z0-9]{1}$/.test(lowerKey) && event.noModifiers()) {
    // Typing in browser
    browserTextIsh += lowerKey
    log('Browser text: ' + browserTextIsh)
  }
})

Bitwig.on('browserOpen', ({ isOpen, title }) => {
  if (title.indexOf('modulator') >= 0 && isOpen) {
    modulatorsOpen = true
    browserOpenAt = new Date()
  } else {
    modulatorsOpen = false
  }

  if (isOpen) {
    browserTextIsh = ''
  }
})

Mouse.on('click', async event => {
  // Add a modulator
  if (modulatorsOpen && new Date() - browserOpenAt < 500) {
    // Focus search field after clicking off
    Mod.runAction('clearBrowserFilters')
    Bitwig.runAction('focus_browser_search_field')
    await wait(250)

    const getToType = () => {
      if (event.Meta) {
        return 'lfo'
      } else if (event.Alt && event.Shift) {
        return 'expressions'
      } else if (event.Shift) {
        return 'ahdsr'
      } else if (event.Alt) {
        return 'audio sidechain'
      } else {
        return 'macro'
      }
    }

    const type = getToType()
    Keyboard.type(type)
    await wait(300)
    Keyboard.keyPress('ArrowDown')

    if (type === 'macro') {
      // Macro-4 currently comes first...
      Keyboard.keyPress('ArrowDown')
    }

    await wait(300)
    Keyboard.keyPress('Enter', { lockpickListeners: true })
    // Reset
    browserOpenAt = new Date(0)

    for (const mod of ['Meta', 'Alt', 'Control', 'Shift']) {
      // Stop modifiers from interfering with click
      // if (event[mod]) Keyboard.keyUp(mod)
    }

    if (type === 'macro') {
      // Click to start renaming macro
      await wait(100)
      Mouse.click(0, { Meta: true, x: event.x, y: event.y - UI.scaleXY({ x: 0, y: 25 }).y })
      Mod.setEnteringValue(true)
    } else {
      // Not sure why but this doesn't work at all...
      await wait(100)
      if (type === 'lfo' || type === 'audio sidechain' || type === 'ahdsr') {
        Mouse.click(0, { x: event.x, y: event.y + 35 })
      }
    }
  }
})

/**
 * Browser tabs
 */
const browserTabsCategory = Mod.registerActionCategory({ title: 'Browser Tabs' })
Mod.registerActionsWithRange('select-browser-tab', 1, 6, i => {
  return {
    defaultSetting: {
      keys: ['Meta', String(i)],
    },
    category: browserTabsCategory,
    description: `Selects browser tab ${i} and refocuses the search field`,
    title: `Select Browser Tab ${i}`,
    contexts: ['browser'],
    action: () => {
      Bitwig.sendPacket({
        type: 'browser/tabs/set',
        data: i - 1,
      })
    },
  }
})

Mod.registerAction({
  id: 'previous-browser-tab',
  title: 'Previous Browser Tab*',
  category: browserTabsCategory,
  description: 'Selects the previous browser tab and refocuses the search field',
  defaultSetting: {
    keys: ['Control', 'ArrowLeft'],
  },
  contexts: ['browser'],
  action: () => {
    Bitwig.sendPacket({
      type: 'browser/tabs/previous',
    })
  },
})
Mod.registerAction({
  id: 'next-browser-tab',
  title: 'Next Browser Tab*',
  category: browserTabsCategory,
  description: 'Selects the next browser tab and refocuses the search field',
  defaultSetting: {
    keys: ['Control', 'ArrowRight'],
  },
  contexts: ['browser'],
  action: () => {
    Bitwig.sendPacket({
      type: 'browser/tabs/next',
    })
  },
})

/**
 * Browser general
 */

Mod.registerAction({
  id: 'open-browser',
  title: 'Open Browser*',
  defaultSetting: {
    keys: ['B'],
  },
  description: `Opens the browser, ensuring the device panel is focused first so this shortcut works all the time`,
  contexts: ['-browser'],
  action: () => {
    Bitwig.sendPacket({
      type: 'action',
      data: [
        `focus_or_toggle_detail_editor`,
        `focus_or_toggle_device_panel`,
        `show_insert_popup_browser`,
        `Select All`,
      ],
    })
  },
})

Mod.registerAction({
  id: 'confirm-browser',
  title: 'Confirm Browser*',
  defaultSetting: {
    keys: ['Enter'],
  },
  description: `Confirms the current choice in the popup browser. If there is a search query and no selected item, the first result will be confirmed`,
  contexts: ['browser'],
  action: () => {
    log(`Browser text is: ${browserTextIsh}`)
    Bitwig.sendPacket({
      type: browserTextIsh.length > 0 ? 'browser/select-and-confirm' : 'browser/confirm',
    })
  },
})

/**
 * Browser filters
 */
Mod.registerAction({
  id: 'clear-browser-filters',
  title: 'Clear Browser filters',
  defaultSetting: {
    keys: ['Alt', '§'],
  },
  description: `Resets all the filters in the currently open popup browser`,
  contexts: ['browser'],
  action: () => {
    Bitwig.sendPacket({
      type: 'browser/filters/clear',
    })
  },
})
