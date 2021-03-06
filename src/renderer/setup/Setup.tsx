import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styled from 'styled-components'
import React from 'react'
import { APP_NAME } from '../../connector/shared/Constants'
import { callAPI, send, sendPromise } from '../bitwig-api/Bitwig'
import { Button } from '../core/Button'
import { Input } from '../core/Input'
import { Spinner } from '../core/Spinner'
const {
  os: { isWindows, isMac },
  setup: { isDirectoryValid },
  getResourcePath,
} = (window as any).preload

const Video = styled.video`
  height: 380px;
  margin: 0 auto;
  margin-bottom: 1.6rem;
  display: block;
  border-radius: 0.4em;
`
const FileChooser = styled.div`
  position: relative;
  margin-top: 2em;
  input {
    padding-right: 5em;
  }
  button {
    position: absolute;
    font-size: 0.9em;
    top: 0;
    bottom: 0;
    right: 0;
    padding-right: 1em;
    padding-left: 1em;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`
const EndButton = styled(Button)`
  margin-top: 1.6rem;
`
const StepContent = styled.div`
  text-align: center;
  margin: 0 auto;
`
const CenterText = styled.div`
  max-width: 25em;
  margin: 0 auto;
`
const StepWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background: #222;
  top: 0;
  bottom: 0;
  position: fixed;
  padding-bottom: 3rem;
`
const StepCircles = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
`
const StepCircle = styled.div`
  width: 0.6em;
  height: 0.6em;
  background: ${(props: any) => (props.isActive ? `#CCC` : props.visited ? `#666` : `#222`)};
  border-radius: 100%;
  cursor: pointer;
  &:hover {
    background: #999;
  }

  &:not(:last-child) {
    margin-right: 0.5em;
  }
`
const StatusMessage = styled.div`
  font-size: 0.8em;
  color: #ccc;
  margin-top: 0.4em;
`
let interval
export class Setup extends React.Component {
  state = {
    step: 0,
    visitedSteps: { 0: true },
    status: {
      bitwigConnected: false,
      accessibilityEnabled: false,
    },
    loading: true,

    userLibraryPath: '',
    checkingLocation: false,
    invalidLocation: false,
  }
  refreshStatus = async () => {
    this.setState({ loading: true })
    try {
      const { data: status } = (await sendPromise({ type: 'api/status' })) as any
      this.setState({ status })
    } catch (e) {
      console.error(e)
    }
    this.setState({ loading: false })
  }
  onFocus = () => {
    this.refreshStatus()
  }
  componentDidMount() {
    clearInterval(interval)
    interval = setInterval(this.refreshStatus, 1000)
    this.refreshStatus()
    ;(async () => {
      const userLibraryPath = await callAPI('api/setup/library-default')
      this.setState({
        userLibraryPath,
      })
    })()
  }
  componentWillUnmount() {
    clearInterval(interval)
    // window.preload.app.removeListener('browser-window-focus', this.onFocus)
  }
  onChooseLocation = async () => {
    try {
      const { filePaths } = await callAPI('api/setup/browse')
      if (filePaths.length) {
        this.setState({ userLibraryPath: filePaths[0] })
      }
      this.onCheckLocation()
    } catch (e) {
      console.error(e)
    }
  }
  onCheckLocation = async () => {
    this.setState({
      checkingLocation: true,
    })
    const path = this.state.userLibraryPath
    const isValid = await isDirectoryValid(path)
    this.setState({
      invalidLocation: !isValid ? path : false,
      checkingLocation: false,
    })
  }
  step0() {
    return {
      description: (
        <div>
          <CenterText>
            Thanks for trying out {APP_NAME}! <br />
            <br />
            Please ensure the location of your Bitwig User Library folder below is correct.
          </CenterText>

          <FileChooser>
            <Input
              style={{ margin: '0 auto', width: '30em' }}
              type="text"
              spellCheck={false}
              autoComplete={'off'}
              value={this.state.userLibraryPath}
              onChange={e => {
                this.setState({ userLibraryPath: e.target.value })
              }}
            />
            <Button onClick={this.onChooseLocation}>Choose</Button>
          </FileChooser>

          <EndButton
            disabled={
              this.state.checkingLocation ||
              this.state.userLibraryPath === String(this.state.invalidLocation)
            }
            onClick={() =>
              !this.state.invalidLocation ? this.onNextStep({ saveLocation: true }) : null
            }>
            Looks good! Continue
          </EndButton>
          <StatusMessage>
            {this.state.checkingLocation ? (
              <>
                <Spinner style={{ marginRight: '.3em' }} />
                Checking Location...
              </>
            ) : null}
            {this.state.invalidLocation ? <>That location doesn't seem right..</> : null}
          </StatusMessage>
        </div>
      ),
      content: null,
    }
  }
  step1() {
    const { bitwigConnected } = this.state.status
    const videoPath = getResourcePath('/videos/setup-0.mp4')
    return {
      description: (
        <div>
          <CenterText>Open Bitwig Settings and enable the "{APP_NAME}" controller.</CenterText>
          <EndButton onClick={this.onNextStep} disabled={!bitwigConnected}>
            Continue
          </EndButton>
          <StatusMessage>
            {bitwigConnected ? (
              <>
                <FontAwesomeIcon icon={faCheck} /> Connected to Bitwig!
              </>
            ) : (
              <>
                <Spinner style={{ marginRight: '.3em' }} /> Waiting for connection...
              </>
            )}
          </StatusMessage>
        </div>
      ),
      content: (
        <Video loop autoPlay>
          <source src={videoPath} type="video/mp4" />
        </Video>
      ),
    }
  }
  step2() {
    const { accessibilityEnabled } = this.state.status
    const onClick = () => {
      if (accessibilityEnabled) {
        this.onNextStep()
      } else {
        send({ type: 'api/setup/accessibility' })
      }
    }
    return {
      description: (
        <div>
          <CenterText>
            {APP_NAME} needs accessibility access in order to monitor keyboard shortcuts globally.
          </CenterText>
          <EndButton onClick={onClick}>
            {accessibilityEnabled ? `Continue` : `Enable Accessibility Access`}
          </EndButton>
          <StatusMessage>
            {accessibilityEnabled ? (
              <>
                <FontAwesomeIcon icon={faCheck} /> Accessibility Enabled!
              </>
            ) : (
              <>
                <Spinner style={{ marginRight: '.3em' }} /> Checking for access...
              </>
            )}
          </StatusMessage>
        </div>
      ),
      content: null,
    }
  }
  step3() {
    const relaunch = () => callAPI('api/setup/relaunch')
    const openPreferences = () => callAPI('api/settings/reload')
    return {
      description: (
        <CenterText>
          All done! If you ever need to see these steps again, click the icon in the menu bar and
          choose "Setup..."
          <br />
          <br />
          {isMac() ? (
            <>
              Restart {APP_NAME} to ensure accessibility access has taken effect.
              <EndButton onClick={relaunch}>Restart</EndButton>
            </>
          ) : (
            <>
              <EndButton onClick={openPreferences}>Open Preferences...</EndButton>
            </>
          )}
        </CenterText>
      ),
      content: null,
    }
  }
  getStepCount() {
    let i = 0
    while (this[`step${i}`]) {
      i++
    }
    return i
  }
  times(n) {
    let arr = []
    let i = 0
    while (i < n) {
      arr.push(i++)
    }
    return arr
  }
  onNextStep = async ({ saveLocation } = {} as any) => {
    if (saveLocation) {
      send({
        type: 'api/settings/set',
        data: {
          key: 'userLibraryPath',
          value: this.state.userLibraryPath,
          type: 'string', // TODO these should be unnecessary from calling code
        },
      })
    }
    let nextI = this.state.step + 1
    if (isWindows() && nextI === 2) {
      nextI++
    }
    if (nextI < this.getStepCount()) {
      this.setState({
        step: nextI,
        visitedSteps: {
          ...this.state.visitedSteps,
          [nextI]: true,
        },
      })
      if (nextI === this.getStepCount() - 1) {
        sendPromise({ type: `api/setup/finish` })
      }
    }
  }
  setStep = i => {
    this.setState({ step: i })
  }
  render() {
    const currStep = this['step' + this.state.step]()
    return (
      <StepWrap>
        <div>
          {currStep.content}
          <StepCircles>
            {this.times(this.getStepCount()).map(i => {
              const onStepClick = () => {
                if (this.state.visitedSteps[i]) {
                  this.setStep(i)
                }
              }
              return (
                <StepCircle
                  key={i}
                  visited={this.state.visitedSteps[i]}
                  isActive={i === this.state.step}
                  onClick={onStepClick}
                />
              )
            })}
          </StepCircles>
          <StepContent>
            <div>{currStep.description}</div>
          </StepContent>
        </div>
      </StepWrap>
    )
  }
}
