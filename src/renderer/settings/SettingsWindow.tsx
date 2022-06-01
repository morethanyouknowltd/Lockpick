import React from 'react'
import _ from 'underscore'
import { ContentWrap, ScrollableSection, SettingsViewWrap } from './SettingsWindowStyles'
import { SettingsFooter } from './SettingsFooter'
import { LockpickComponent } from '../core/LockpickComponent'
import { ModsSidebar } from './ModsSidebar'
import { ModView } from './mod-settings/ModView'
import { MTYK_API_ROOT } from '../../connector/shared/Constants'
import { MainErrorBoundary } from '../core/MainErrorBoundary'
import { Preferences } from './Preferences'
import { Route, withRouter } from 'react-router-dom'
import { state } from '../core/State'
import { Observer } from 'mobx-react-lite'

const Classs = class SettingsWindow extends LockpickComponent<any> {
  state = {
    loading: true,
    selectedModId: null,
    searchQuery: '',
    versionInfo: null,
    preferencesOpen: false,
  }

  get selectedMod() {
    return state.modsById[this.state.selectedModId]
  }

  async fetchData() {
    this.setState({
      loading: true,
    })
    await state.fetchMods({ selected: this.selectedMod })

    let selectedMod = null
    let idPrecedence = [
      this.state.selectedModId,
      window.localStorage.getItem('lastSelectedModId'),
      state.modsArray[0]?.id,
    ]
    while (!selectedMod && idPrecedence.length) {
      selectedMod = state.modsById[idPrecedence.shift()]
    }
    const newState = {
      loading: false,
      selectedModId: selectedMod?.id,
    }
    this.setState(newState)
  }

  setSelectedMod(modId) {
    this.setState({ selectedModId: modId })
    window.localStorage.setItem('lastSelectedModId', modId)
  }

  async componentDidMount() {
    await this.fetchData()
    this.addAutoPacketListener('event/mods-reloaded', packet => {
      this.fetchData()
    })
    this.addAutoSetInterval(
      async () => {
        try {
          this.setState({
            versionInfo: await fetch(`${MTYK_API_ROOT}/v1/modwig/versions/latest`).then(res =>
              res.json()
            ),
          })
        } catch (e) {
          console.error(e)
        }
      },
      1000 * 60 * 60 * 5,
      true
    )

    // Prepare preferences window
    state.loadSettings([`notifications-actions`, `notifications-reloading`])
  }

  renderDebug = () => {
    return <div>hello i am debug</div>
  }

  renderSettings = () => {
    return (
      <Observer>
        {() => {
          return (
            <ContentWrap>
              <ScrollableSection style={{ width: '15rem' }}>
                <ModsSidebar
                  mods={state.modsArray}
                  currentMod={this.selectedMod}
                  setCurrentMod={mod => this.setSelectedMod(mod.id)}
                  searchQuery={this.state.searchQuery}
                  setSearchQuery={q => this.setState({ searchQuery: q })}
                />
              </ScrollableSection>
              {this.selectedMod ? (
                <ScrollableSection style={{ left: '15rem', width: 'calc(100% - 15rem)' }}>
                  <ModView modId={this.state.selectedModId} />
                </ScrollableSection>
              ) : null}
            </ContentWrap>
          )
        }}
      </Observer>
    )
  }

  render() {
    const { match } = this.props
    // console.log(this.props)
    const togglePreferencesOpen = () => {
      this.setState({ preferencesOpen: !this.state.preferencesOpen })
    }
    return (
      <MainErrorBoundary>
        <Observer>
          {() => {
            return (
              <SettingsViewWrap>
                <Route exact path={`/settings`} render={this.renderSettings} />
                <Route exact path={`/settings/debug`} render={this.renderDebug} />
                <SettingsFooter
                  togglePreferencesOpen={togglePreferencesOpen}
                  preferencesOpen={this.state.preferencesOpen}
                  versionInfo={this.state.versionInfo}
                />
                {this.state.preferencesOpen ? (
                  <Preferences togglePreferencesOpen={togglePreferencesOpen} />
                ) : null}
              </SettingsViewWrap>
            )
          }}
        </Observer>
      </MainErrorBoundary>
    )
  }
}

export const SettingsWindow = withRouter(Classs)
