import React from 'react'
import { styled } from 'linaria/react'
import { APP_NAME, MTYK_API_ROOT } from '../../connector/shared/Constants'
import { Button } from './Button'
import { send } from '../bitwig-api/Bitwig'

const Wrap = styled.div`
  background: #222;
  position: absolute;
  color: white;
  align-items: center;
  justify-content: center;
  display: flex;
  top: 0;
  text-align:center;
  left: 0;
  bottom: 0;
  right: 0;
  -webkit-app-region: drag;
  > * {
      -webkit-app-region: no-drag;
  }
  a {
        margin-top: 0.5em;
        display: inline-block;
      &:not(last-child) {
          margin-right: 1em;
      }
  }
`
const Stack = styled.div`
    background: #191919;
    font-family: Menlo, monospace;
    font-size: .8em;
    white-space: pre-wrap;
    text-align: left;
    padding: 1em;
    max-width: 44em;
    border-radius: .3em;
    color: #9a9a9a;
    margin: 1.4em 0;
`

export class MainErrorBoundary extends React.Component {
    state = {
        hasError: false,
        error: null,
        errorInfo: null,
        contactInfo: {
            Discord: 'https://discord.com/invite/6Wetp3ZsKv',
            Email: 'mailto:andy@morethanyouknow.co.uk'
        }
    }

    componentDidCatch(error, errorInfo) {
      // You can also log the error to an error reporting service
      console.error(error, errorInfo);
      this.setState({error, errorInfo, hasError: true})
    }
  
    async componentDidMount() {
        try {
            const contact = await fetch(`${MTYK_API_ROOT}/v1/links`).then(res => res.json())
            this.setState({contact})
        } catch (e) {
            console.error(e)
        }
    }

    render() {
      if (this.state.hasError) {
          const onButtonClick = () => {
              send({type: 'api/settings/reload'})
          }
        // You can render any custom fallback UI
        return <Wrap>
            <div>
                <div style={{marginBottom: '.5em'}}>{APP_NAME} settings window crashed.</div>

                {/* {this.state.error.message ? this.state.error.message : null} */}
                {this.state.error.stack ? <Stack>{this.state.error.stack}</Stack> : null}
                <Button onClick={onButtonClick}>Reload</Button>

                <div style={{marginTop: '3rem', fontSize: '.9em', color: '#888'}}>
                    <div>If this keeps happening, please get in touch and we'll try to fix it</div>
                    {Object.keys(this.state.contactInfo).map(via => {
                        const address = this.state.contactInfo[via]
                        return <a key={via} href={address}>
                            {via}
                        </a>
                    })}
                </div>
            </div>
        </Wrap>
      }
  
      return this.props.children; 
    }
  }