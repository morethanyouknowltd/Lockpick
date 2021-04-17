import React, { useState } from 'react'
import { styled } from 'linaria/react'
import _ from 'underscore'
import { humanise } from './helpers/settingTitle'
import { SidebarItemWrap, SidebarSectionWrap, TopHalf } from './ModsSidebarStyles'
import { Flex } from '../core/Flex'
import { Input } from '../core/Input'
import { Warning } from '../core/Warning'

const ModSidebarWrap = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    background: #151515;
    flex-direction:column;
    bottom: 0;
    display: flex;
    >:nth-child(2) {
        flex-grow: 1;   
        overflow-y:auto;
    }
`

const Indicator = styled.div`
    width: .3em;
    height: .3em;
    background: ${(props: any) => props.on ? 'green' : '#444'};
    display: inline-block;
    border-radius: 1000px;
`

const SidebarItem = ({ children, filterId, onClick, ...rest }) => {
    return <SidebarItemWrap onClick={onClick} {...rest}>
        { children }
    </SidebarItemWrap>
}

const SidebarSection = ({title, children}) => {
    return <SidebarSectionWrap>
        {title ? <div style={{color: '#666', marginBottom: '.8em'}}>{title}</div> : null}
        {children}
    </SidebarSectionWrap>
}

const SidebarModList = ({ mods, currentMod, setCurrentMod }) => {
    return <div>
        {mods.map(mod => {          
            const enabled = mod.value.enabled
            return <SidebarItem key={mod.key} focused={(currentMod?.id ?? null) === mod.id} onClick={() => setCurrentMod(mod)} filterId={mod.key} title={mod.name || mod.key}>
                <Flex justifyContent={'space-between'}>
                    <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        <span style={{marginRight: '.8em', width: '.6em'}}><Indicator on={enabled ? "true" : ''} /></span>
                        <span>{mod.name || mod.key}{mod.error ? <Warning title={`There was an error loading this mod (click for details)`} /> : null}</span>
                    </div>
                    {/* <span>{mod.actions.length}</span> */}
                </Flex>
            </SidebarItem>
        })}
    </div>
}

export const ModsSidebar = ({mods, currentMod, setCurrentMod, searchQuery, setSearchQuery}) => {
    const modsByCategory = _.groupBy(mods, 'category')
    const recentlyAdded = mods.filter(mod => {
        return new Date().getTime() - new Date(mod.createdAt).getTime() < 1000 * 60 * 60 * 24 * 7
    })
    return <ModSidebarWrap>
        <TopHalf style={{paddingTop: '2.5rem'}}>
            {/* <Input type="search" autoFocus placeholder="Search" style={{marginBottom: '1.5rem'}} /> */}
            {/* <SidebarSection title={null}>
                <SidebarItem onClick={() => setCurrentMod(null)} filterId={null}>All Mods</SidebarItem>
            </SidebarSection> */}
        </TopHalf>
        <div style={{padding: '1.5em', paddingTop: 0}}>
            {recentlyAdded.length ? <SidebarSection title="Recently Added">
                <SidebarModList currentMod={currentMod} setCurrentMod={setCurrentMod} mods={recentlyAdded} />
            </SidebarSection> : null}

            {Object.keys(modsByCategory).sort((a, b) => a < b ? -1 : 1).map(category => {
                const modsForThisCategory = modsByCategory[category].sort((a, b) => {
                    return a.name < b.name ? -1 : 1
                })
                return <SidebarSection title={humanise(category)} key={category}>
                    <SidebarModList currentMod={currentMod} setCurrentMod={setCurrentMod} mods={modsForThisCategory} />
                </SidebarSection>
            })}
        </div>
    </ModSidebarWrap>
}