import React from 'react'
import { ContentWrap, ScrollableSection, SettingsViewWrap } from './SettingsWindowStyles'
import _ from 'underscore'
import { SettingsFooter } from './SettingsFooter'
import { ModwigComponent } from '../core/ModwigComponent'
import { ModsSidebar } from './ModsSidebar'
import { ModView } from './ModView'
import { MTYK_API_ROOT } from '../../connector/shared/Constants'
import { MainErrorBoundary } from '../core/MainErrorBoundary'
import { Preferences } from './Preferences'
import { Switch, Route, withRouter } from 'react-router-dom'
import { state } from '../core/State'
import { observer, Observer } from 'mobx-react-lite'

const Classs = class SettingsWindow extends ModwigComponent<any> {

    state = {
        loading: true,
        selectedMod: null,
        searchQuery: '',
        versionInfo: null
    }

    async fetchData() {
        this.setState({
            loading: true
        })
        await state.fetchMods({ selected: this.state.selectedMod })
        const newState = {
            loading: false,
            selectedMod: this.state.selectedMod || state.modsArray[0]
        }
        this.setState(newState)
    }

    async componentDidMount() {
        await this.fetchData()
        this.addAutoPacketListener('event/mods-reloaded', packet => {
            this.fetchData()
        })
        this.addAutoSetInterval(async () => {
            try {
                this.setState({
                    versionInfo: await fetch(`${MTYK_API_ROOT}/v1/modwig/versions/latest`).then(res => res.json())
                })
            } catch (e) {
                console.error(e)
            }
        }, 1000 * 60 * 60 * 5, true)
    }

    renderSettings = () => {
        return <Observer>{() => {
            return <ContentWrap><ScrollableSection style={{width: '20%'}}>
                <ModsSidebar 
                    mods={state.modsArray} 
                    currentMod={this.state.selectedMod} 
                    setCurrentMod={(mod) => {this.setState({selectedMod: mod})}} 
                    searchQuery={this.state.searchQuery} 
                    setSearchQuery={(q) => this.setState({searchQuery: q}) } />
                </ScrollableSection>
                {this.state.selectedMod ? <ScrollableSection style={{left: '20%', width: '80%'}}><ModView modId={this.state.selectedMod.id} /></ScrollableSection> : null}
            </ContentWrap>}
        }</Observer>
    }

    render() {
        const { match } = this.props
        // console.log(this.props)
        const togglePreferencesOpen = () => {
            if (this.props.location.pathname.indexOf('preferences') >= 0) {
                this.props.history.push('/settings')
            } else {
                this.props.history.push('/settings/preferences')
            }
        }
        return <MainErrorBoundary>       
            <Observer>{() => {
                return <SettingsViewWrap>
                    <Switch>
                        <Route path={`${match.path}/preferences`} component={Preferences} />
                        <Route render={this.renderSettings} />
                    </Switch>
                    <SettingsFooter togglePreferencesOpen={togglePreferencesOpen} preferencesOpen={this.props.location.pathname.indexOf('preferences') >= 0} versionInfo={this.state.versionInfo} />
                </SettingsViewWrap>
            }}
            </Observer>
        </MainErrorBoundary>
    }
}

export const SettingsWindow = withRouter(Classs)