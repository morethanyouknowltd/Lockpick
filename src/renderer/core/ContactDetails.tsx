import React from 'react'
import styled from from 'styled-components'
import { MTYK_API_ROOT } from '../../connector/shared/Constants'

const Wrap = styled.div`
  a {
    margin-top: 0.5em;
    display: inline-block;
    &:not(last-child) {
      margin-right: 1em;
    }
  }
`

export class ContactDetails extends React.Component<any> {
  state = {
    contactInfo: {
      Discord: 'https://discord.com/invite/6Wetp3ZsKv',
      Email: 'mailto:andy@morethanyouknow.co.uk',
    },
  }

  async componentDidMount() {
    try {
      const contact = await fetch(`${MTYK_API_ROOT}/v1/links`).then(res => res.json())
      this.setState({ contact })
    } catch (e) {
      console.error(e)
    }
  }

  render() {
    return (
      <Wrap {...this.props}>
        <div style={{ fontSize: '.9em', color: '#888' }}>
          {Object.keys(this.state.contactInfo).map(via => {
            const address = this.state.contactInfo[via]
            return <a href={address}>{via}</a>
          })}
        </div>
      </Wrap>
    )
  }
}
