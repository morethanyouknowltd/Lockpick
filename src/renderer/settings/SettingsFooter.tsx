import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { sendPromise } from '../bitwig-api/Bitwig'
import { Footer, VersionInfoWrap, SettingsIcon } from './SettingsFooterStyles'
import { Button } from '../core/Button'
import { withRouter } from 'react-router-dom'
import { APP_VERSION } from '../../connector/shared/Constants'
import { Flex } from '../core/Flex'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCogs } from '@fortawesome/free-solid-svg-icons'
import { Select } from '../core/Select'

const LabelledSelect = ({ label, options, value, onChange, ...rest }) => {
  return (
    <div {...rest}>
      <span style={{ color: '#444', fontSize: '.9em', paddingRight: '.8em' }}>{label}</span>
      <Select value={value} onChange={onChange}>
        {options}
      </Select>
    </div>
  )
}

const VersionInfo = ({ versionInfo }) => {
  function cmp(a, b) {
    var pa = a.split('.')
    var pb = b.split('.')
    for (var i = 0; i < 3; i++) {
      var na = Number(pa[i])
      var nb = Number(pb[i])
      if (na > nb) return 1
      if (nb > na) return -1
      if (!isNaN(na) && isNaN(nb)) return 1
      if (isNaN(na) && !isNaN(nb)) return -1
    }
    return 0
  }

  if (!versionInfo || cmp(versionInfo.version, APP_VERSION) <= 0) {
    return null
  }

  // TODO consider ARM macs
  const dlLink =
    process.platform === 'darwin' ? versionInfo.downloads.macx64 : versionInfo.downloads.windows
  const moreInfo = versionInfo.info + `?version=${APP_VERSION}`
  return (
    <VersionInfoWrap>
      <div>Update available (v{versionInfo.version})</div> <Button link={dlLink}>Download</Button>{' '}
      <Button secondary link={moreInfo}>
        More info
      </Button>
    </VersionInfoWrap>
  )
}

const NavLinkStyle = styled.div`
  font-size: 1.2em;
  padding: 0 1em;
  color: ${(props: any) => (props.isActive ? `white` : `#777`)};
  cursor: pointer;
  &:hover {
    color: ${(props: any) => (props.isActive ? `white` : `#CCC`)};
  }
` as any
const FooterNavLink = withRouter(({ href, match, children, history }) => {
  const onClick = () => {
    history.push(href)
  }
  return (
    <NavLinkStyle isActive={match.path === href} onClick={onClick}>
      {children}
    </NavLinkStyle>
  )
})

export const SettingsFooter = withRouter(
  ({ versionInfo, history, preferencesOpen, togglePreferencesOpen }) => {
    const Settings = {
      uiScale: '100%',
      uiLayout: 'Single Display (Large)',
    }
    const state: any = {}
    for (const key in Settings) {
      const defaultVal = Settings[key]
      state[key] = useState(defaultVal)
    }

    useEffect(() => {
      ;(async () => {
        for (const key in state) {
          const { data: setting } = await sendPromise({ type: 'api/settings/get', data: key })
          // console.log(value)
          state[key][1](setting.value)
        }
      })()
    }, [1])

    const onSettingChange = setting => event => {
      const value = event.target.value
      sendPromise({
        type: 'api/settings/set',
        data: {
          key: setting,
          value,
        },
      })
      state[setting][1](value)
    }

    // console.log(state)
    return (
      <Footer>
        <Flex alignItems="center">
          <SettingsIcon onClick={togglePreferencesOpen}>
            <FontAwesomeIcon icon={faCogs} />
          </SettingsIcon>
          <VersionInfo versionInfo={versionInfo} />
        </Flex>
        {/* <Flex>
            <FooterNavLink href="/settings">Mods</FooterNavLink>
            <FooterNavLink href="/settings/debug">Debug</FooterNavLink>
        </Flex> */}
        <Flex alignItems="center">
          <LabelledSelect
            style={{ marginRight: '1rem' }}
            label="UI Scale"
            value={state.uiScale[0]}
            onChange={onSettingChange('uiScale')}
            options={['100%', '125%', '150%', '175%'].map(size => {
              return (
                <option key={size} value={size}>
                  {size}
                </option>
              )
            })}
          />
          <LabelledSelect
            label="UI Layout"
            value={state.uiLayout[0]}
            onChange={onSettingChange('uiLayout')}
            options={['Single Display (Large)', 'Single Display (Small)'].map(size => {
              return (
                <option key={size} value={size}>
                  {size}
                </option>
              )
            })}
          />
          {/* <Button style={{marginLeft: '1rem'}} >Upgrade</Button> */}
        </Flex>
      </Footer>
    )
  }
)
