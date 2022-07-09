import React from 'react'
import styled from 'styled-components'
import { LockpickComponent } from '../core/LockpickComponent'
import { shortcutToTextDescription } from '../settings/helpers/settingTitle'
import { faBolt, faInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Spinner } from '../core/Spinner'
import { TrackVolumePopup } from './canvas/TrackVolumePopup'
import { AutomationPopover } from './canvas/AutomationPopover'
import { PopupRenderer } from './PopupRenderer'
const { clipboard } = (window as any).preload

const Wrap = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`
const NotificatinosWrap = styled.div`
  position: absolute;
  left: 0;
  bottom: 27em;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`
const Static = styled.div`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      transform: translateY(0%);
    }
  }
  animation: slideIn 0.3s linear 1;
  animation-fill-mode: forwards;
  position: absolute;
  color: #ccc;
  font-size: 1em;
  bottom: 0.95rem;
  right: 15rem;
  display: flex;
  align-items: center;
  > * {
    display: flex;
    align-items: center;
    margin-left: 1rem;
  }
`
const Notification = styled.div`
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10%);
    }

    to {
      transform: translateY(0%);
      opacity: 1;
    }
  }
  animation: slideIn 0.3s linear 1;
  animation-fill-mode: forwards;
  position: relative;
  /* flex-wrap: wrap; */
  /* display: flex;
    align-items: center; */
  text-align: left;
  width: 20em;
  font-size: 0.85rem;
  border-radius: 0.3em;
  margin-top: 0.2em;
  /* border-radius: .3em; */
  /* justify-content: center; */
  background: rgba(0, 0, 0, 0.5);
  color: white;
`
const notifTimeoutCheckFreqMS = 500

const IconNotifWrap = styled.div`
  display: flex;
  position: relative;
  align-items: center;
  > * {
  }
  > :nth-child(1) {
    padding: 0.4em 0.8em;
    font-size: 0.8em;
    border-right: 1px solid #777;
  }
  > :nth-child(2) {
    padding: 0.4em 0.8em;
  }
`
const ProgressLine = styled.div`
  position: absolute;
  bottom: -0.2em;
  transition: width 0.3s;
  left: 0;
  width: ${(props: any) => Math.round(props.value * 100) + '%'};
  background: #f97012;
  height: 0.2em;
`
const IconNotification = ({ notification: notif, children }) => {
  const iconMap = {
    actionTriggered: {
      icon: faBolt,
      color: '#d9c955',
    },
  }
  const notifInfo = iconMap[notif.type] || {
    icon: faInfo,
    color: 'white',
  }
  const icon = <FontAwesomeIcon icon={notifInfo.icon} /> || <div>□</div>
  return (
    <IconNotifWrap>
      {notif.type === 'progress' ? (
        <Spinner style={{}} />
      ) : (
        <div style={{ color: notifInfo.color }}>{icon}</div>
      )}
      <div>{children}</div>
    </IconNotifWrap>
  )
}

class NotificationErrorBoundary extends React.Component {
  state = {
    error: null,
  }
  componentDidCatch(e) {
    this.setState({ error: e })
  }
  render() {
    if (this.state.error) {
      return `Error rendering notification`
    }
    return this.props.children
  }
}

export class Canvas extends LockpickComponent<any> {
  canvasRef = React.createRef<HTMLCanvasElement>()
  state = {
    notifications: [],
    browserIsOpen: false,
    enteringValue: false,

    // Different types of static notification
    volume: null,
    automationLevel: null,
    popups: [],
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    let newProgressIds = new Set()
    let stateAdditions: any = {}
    const newNotifications = (nextProps.notifications || [])
      .map(notif => {
        if (notif.type === 'progress') {
          newProgressIds.add(notif.progressId)
          if (notif.progress !== 1) {
            // Progress notifications don't have a timeout (unless they're complete)
            delete notif.timeout
            return notif
          }
        }
        if (notif.copy) {
          clipboard.writeText(notif.content)
        }
        if (notif.type === 'volume') {
          stateAdditions.volume = notif
          return null
        }
        if (notif.type === 'hoverLevels') {
          stateAdditions.automationLevel = notif
          return null
        }
        return {
          ...notif,
          timeout: new Date().getTime() + notif.timeout,
        }
      })
      .filter(n => !!n)
    this.setState({
      ...stateAdditions,
      ...nextProps,
      notifications: this.state.notifications
        .filter(oldNotif => {
          if (oldNotif.type === 'progress') {
            return !newProgressIds.has(oldNotif.progressId)
          }
          return true
        })
        .concat(newNotifications),
    })

    const timeoutUntilAllDone = () => {
      const now = new Date()
      const newNotifs = this.state.notifications.filter(
        notif => !notif.timeout || now < notif.timeout
      )
      this.setState({
        notifications: newNotifs,
      })
      if (newNotifs.length > 0) {
        setTimeout(timeoutUntilAllDone, notifTimeoutCheckFreqMS)
      }
    }
    setTimeout(timeoutUntilAllDone, notifTimeoutCheckFreqMS)
  }
  componentDidMount() {}
  renderNotification(notif) {
    if (!notif.type) {
      return <IconNotification notification={notif}>{notif.content}</IconNotification>
    } else if (notif.type) {
      const typeRenderers = {
        progress: notif => {
          return (
            <IconNotification notification={notif}>
              {notif.title}
              <ProgressLine value={notif.progress} />
            </IconNotification>
          )
        },
        actionTriggered: notif => {
          return (
            <IconNotification notification={notif}>
              {shortcutToTextDescription({ value: notif.data.keyState })} {notif.data.title}
            </IconNotification>
          )
        },
      }

      if (notif.type in typeRenderers) {
        return typeRenderers[notif.type](notif)
      } else {
        return <div>Unsupported notification type: {notif.type}</div>
      }
    }
  }

  renderNotifications() {
    return (
      <NotificatinosWrap>
        {this.state.notifications.map(notif => {
          return (
            <Notification
              key={notif.type === 'progress' ? 'progress' + notif.progressId : notif.id}>
              <NotificationErrorBoundary>
                {this.renderNotification(notif)}
              </NotificationErrorBoundary>
            </Notification>
          )
        })}
      </NotificatinosWrap>
    )
  }
  render() {
    return (
      <>
        <Wrap>
          {/* <div>Lockpick Canvas Active</div> */}
          <canvas ref={this.canvasRef} />
          {this.renderNotifications()}
          <Static>
            {this.state.volume && this.state.volume.track ? (
              <TrackVolumePopup {...this.state.volume} />
            ) : null}
            {this.state.automationLevel && this.state.automationLevel.track ? (
              <AutomationPopover {...this.state.automationLevel} />
            ) : null}
          </Static>
        </Wrap>
        <PopupRenderer popups={this.state.popups} />
      </>
    )
  }
}
