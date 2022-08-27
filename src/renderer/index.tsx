import './core/styles.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Switch, Route, HashRouter, useHistory, useLocation } from 'react-router-dom'
import { SearchPanel } from './search/SearchPanel'
import { Setup } from './setup/Setup'
import { SettingsWindow } from './settings/SettingsWindow'
import { NumpadWindow } from './core/numpad-window/NumpadWindow'
import { Message } from './core/message/Message'
import { TransportNavPopup } from './mods/TransportNavPopup'
import { Canvas } from './mods/Canvas'
import { useState } from 'react'
import { ClickableCanvas } from './mods/ClickableCanvas'
import { init } from '@mtyk/dev-client'
init({ name: 'lockpick-renderer', wrapDefaultConsole: true })

// function removeAllListeners() {
//     app.removeAllListeners('browser-window-focus')
//     app.removeAllListeners('browser-window-blur')
// }
// removeAllListeners()

// Disable undo/redo across entire browser. This is because we pass those events (among others) to Bitwig. However
// we may need to modify this for settings page etc...
document.body.onkeydown = function (e) {
  if (e.key === 'z' && e.metaKey) {
    e.preventDefault()
  }
}
document.body.onkeyup = function (e) {
  if (e.key === 'z' && e.metaKey) {
    e.preventDefault()
  }
}

/**
 * Required wrapper for anything that uses the 'windowOpener' style functions in ModsService.
 * Attaching data to the window object is the simplest way of passing it I've found
 */
const windowDataAsProps = Component => {
  return () => {
    const [, updateState] = useState({})
    const location = useLocation()
    // If the path is the same as requested, skip setting history and just set state directly
    ;(window as any).didUpdateState = path => {
      if (location.pathname === path) {
        updateState({})
        return true
      }
      return false
    }
    const windowData = (window as any).data
    if (!windowData) {
      return <div>No data ready</div>
    }
    return <Component {...windowData} />
  }
}

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/settings" component={SettingsWindow} />
      <Route path="/setup" component={Setup} />
      <Route path="/search" component={SearchPanel} />
      <Route path="/numpad" component={NumpadWindow} />
      <Route path="/message" component={windowDataAsProps(Message)} />
      <Route path="/transport-nav-popup" component={windowDataAsProps(TransportNavPopup)} />
      <Route path="/canvas" component={windowDataAsProps(Canvas)} />
      <Route path="/clickable-canvas" component={windowDataAsProps(ClickableCanvas)} />
      <Route
        path="/loading"
        component={() => {
          const history = useHistory()
          ;(window as any).loadURL = url => history.push(url)
          return <div />
        }}
      />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
)
