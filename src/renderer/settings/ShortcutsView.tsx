import React, { useState } from 'react'
import { styled } from 'linaria/react'
import { settingShortDescription, settingTitle, shortcutToTextDescription, shouldShortcutWarn } from './helpers/settingTitle'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { SettingShortcut } from './setting/SettingShortcut'
import _ from 'underscore'
import { Warning } from '../core/Warning'
const TableWrap = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 36.2%;
    overflow-y: auto;
    

    tbody tr {
        &:not(.nonrow) {
            cursor: pointer;
            &:hover {
                background: #181818;
            }
        }
    }
    th, td {
        padding: 0.3em 2rem;

        &:not(:last-child) {
            /* border-right: 1px solid #111; */
        }
    }
    th {
        text-align: left;
        font-weight: 400;
        padding-top: .9em;
        padding-bottom: 1em;
        color: #5b5b5b;
    }
    td {
        opacity: ${(props: any) => props.enabled ? '1' : '.2'};
        font-size: .9em;
        /* color: #ccc; */
        color: #b6b6b6;
        &:not(:first-child) {
            color: #555;
        }
    }
    table {
        width: 100%;
    }
    table, th, td {
        /* border: 1px solid black; */
        border-collapse: collapse;
    }
`
const Wrap = styled.div`
`
const ShortcutTableCell = styled.div`
    background: #101010;
    border-radius: .5em;
    display: flex;
    color: #8c8c8c;
    align-items: center;
    justify-content: center;

`
const InfoPanelWrap = styled.div`
position: absolute;
top: 0;
left: 63.8%;
font-size: .9em;
bottom: 0;
right: 0;
overflow-y: auto;
background: #121212;
border-left: 1px solid black;
> div {
    padding: 2rem;
    >h1 {
        font-size: 1.1em;
        font-weight: 400;
        color: #a7a7a7;
    }
    >p {
        margin-top: 2rem;
        color: #717171;
    }
    >div {
        margin-top: 5.5rem;
        max-width: 11.9rem;
        margin: 2.5rem auto;
    }
}
`
const InfoPanel = ({selectedSetting}) => {
    if (selectedSetting) {
        return <InfoPanelWrap>
            <div>
                <h1>{settingTitle(selectedSetting)}</h1>
                <p>{settingShortDescription(selectedSetting)}</p>
                <div><SettingShortcut setting={selectedSetting} /></div>
            </div>
        </InfoPanelWrap>
    } else {
        return <InfoPanelWrap>
            {/* <div>Select a setting to see more info.</div>         */}
        </InfoPanelWrap>
    }
}

export const ShortcutsView = ({ settings, selectedMod }) => {
    const [selectedSetting, setSelectedSetting] = useState(null)

    const settingsByCategory = _.groupBy(settings, sett => sett.category ? sett.category.title : null)

    return <Wrap>
        <TableWrap enabled={selectedMod.value.enabled}>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        {selectedMod ? null : <th>Mod</th>}
                        <th>Shortcut</th>
                    </tr>
                </thead>
                <tbody>
                {Object.keys(settingsByCategory).map((category, catI) => {
                    const settings = settingsByCategory[category]
                    const settingsRows = settings.sort((a, b) => {
                        const aParts = (a.title || '').split(' ')
                        const bParts = (b.title || '').split(' ')
                        const noEnd = p => p.slice(0, p.length - 1).join(' ')
                        const [numberA, numberB] = [
                            parseFloat(aParts[aParts.length - 1]), 
                            parseFloat(bParts[bParts.length - 1])
                        ]
                        // console.log(noEnd(aParts), noEnd(bParts), numberA, numberB)
                        if (noEnd(aParts) === noEnd(bParts) && !isNaN(numberA) && !isNaN(numberB)) {
                            // if both end in number and have the same rest of text, compare the numbers
                            return numberA - numberB
                        }
                        return a.title < b.title ? -1 : 1
                    }).map(sett => {
                        const onShortcutClick = () => {
                            setTimeout(() => {
                                document.getElementById(`SettingShortcut${sett.id}`).focus()
                            }, 100)
                        }
                        return <tr key={sett.key} onClick={() => setSelectedSetting(sett)} style={sett.key === (selectedSetting?.key ?? null) ? {background: '#111'} : {}}>
                            <td>{settingTitle(sett)}</td>
                            {selectedMod ? null : <td>{sett.modName}</td>}
                            <td onClick={onShortcutClick}><ShortcutTableCell>{shortcutToTextDescription(sett)} {shouldShortcutWarn(sett) ? <Warning title={`Please note it's currently not possible to prevent single character shortcuts from triggering in text fields`} /> : null}</ShortcutTableCell></td>
                            {/* <td></td> */}
                        </tr>
                    })
                    const categoryRow = <tr className="nonrow" key={"cat"+category} style={{
                        height: catI === 0 ? '' : '4.2em',
                        verticalAlign: 'bottom',
                        paddingBottom: '.5em'
                    }}>
                            <td style={{
                    
                            color: '#656565',
                            fontSize: '1em'
                    }}>
                            {String(category) === 'null' ? 'General' : category}
                        </td>
                        <td></td>
                    </tr>
                    return <React.Fragment key={"cat" + category}>
                        {categoryRow}
                        {settingsRows}
                    </React.Fragment>
                })}
                </tbody>
            </table>
        </TableWrap>
        <InfoPanel selectedSetting={selectedSetting} />
    </Wrap>
}