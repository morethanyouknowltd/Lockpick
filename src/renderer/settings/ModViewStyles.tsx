import { styled } from 'linaria/react'

export const Wrap = styled.div`
    background: #1e1e1e;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    > div {
        position: absolute;
        top: 0;
        bottom: 0;
        &:nth-child(2) {
            overflow-y: auto;
        }
    }
`
export const SearchIconWrapStyle = styled.div`
    font-size: .7em;
    background: #5f5f5f;
    width: 2em;
    height: 2em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 1000px;
    cursor: pointer;
    &:hover {
        background: #444;
    }
`
export const ModSettings = styled.div`
    border-bottom: 1px solid #222;
    padding: 1rem 2rem;
`
export const ModSettingItemWrap = styled.div`
&:not(:last-child) {
    margin-bottom: 1.8em;
}
.toggle {
    font-size: 0.7em;
    flex-shrink: 0;
    margin-left: 1em;
}
.name {
    font-size: .8em;
    color: #a2a2a2;
    margin-bottom: .9em;
}
.desc {
    font-size: .8em;
    color: #737373;
}
`
export const xPad = `4rem`
export const SettingsViewWrap = styled.div`
    display: flex;
    height: 100%;
    width:100%;
    position: absolute;
    flex-direction: column;
    >:nth-child(1) {
        background:#444;
        border-bottom: 1px solid black;
        -webkit-app-region: drag; 
        > * {
            -webkit-app-region: no-drag; 
        }
        padding-left: 84px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 2.4rem;
    }
    >:nth-child(2) {
        flex-grow: 1;
    }
    >:nth-child(3) {
        flex-shrink: 0;
    }
`
export const ScrollableSection = styled.div`
    overflow-y: auto;
    position: absolute;
    top: 0;
    bottom: 0;

`
export const NavSplit = styled.div`
    position: relative;
    > * {
        overflow-y: auto;
        position: absolute;
        top: 0;
        bottom: 0;
    }
    >:nth-child(1) {
        left: 0;
        border-right: 1px solid black;
        width: 18rem;
        background: #1d1d1d;
        color: #616161;
        padding: 0.8rem 1rem;
    }
    >:nth-child(2) {
        right: 0;
        width: calc(100% - 18rem);
    }
`
export const Search = styled.input`
    background: #333;
    border: none;
    height: 100%;
    padding: 0px 0.9em;
    color: white;
    &:focus {
        outline: none;
        background: #111;
    }

`
export const NoMods = styled.div`
    text-align: center;
    border: 1px solid #444;
    border-left: none;
    border-right: none;
    padding: 2em 0;
    >:first-child {
        color: #AAA;
    }
    >:nth-child(2) {
        color: #666;
        font-size: .9em;
        margin-top: .5em;
    }

`
export const ModAndLogs = styled.div`
    
`
export const Tabs = styled.div`
    display: flex;
    height: 100%;
    align-items: center;
    justify-content: flex-start;

`
export const Tab = styled.div`
    color: ${(props: any) => props.active ? `white` : `#888`};
    padding: 0 .8em;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    &:hover {
        transition: color .25s;
        color: ${(props: any) => props.active ? `white` : `#AAA`};;
    }
`
export const SettingTitle = styled.div`
    color: #CCC;
`
export const SettingDesc = styled.div`
    color: #9c9c9c;
    margin-top: .6rem;
    line-height: 1.5;
    font-size: 1em;
`

export const SidebarSetting = styled.div`
    font-size: .9em;
    white-space: nowrap;
    margin-bottom: .2rem;
    user-select: none;
    
    &:hover {
        cursor: pointer;
        color: ${(props: any) => props.focused ? '#CCC' : '#AAA'};
    }
    color: ${(props: any) => (props.focused ? '#CCC' : '')};
    display: flex;
    align-items: center;
    > * {
        display: flex;
    }
    >:nth-child(1) {
        width: 4rem;
        flex-shrink: 0;
        margin-right: .5rem;
    }
    >:nth-child(2) {
        color: ${(props: any) => ((props.valid === false || props.error) ? 'red' : (props.focused ? '#CCC' : props.enabled ? '' : '#4c4c4c'))};
        text-overflow: ellipsis;
        overflow: hidden;    
    }

` as any

export const SettingItemWrap = styled.div`
    display: flex;
    width: 100%;    
    
    background: ${(props: any) => props.focused ? `#1e1e1e` : `transparent`};
    transition: background .5s;
    >:nth-child(1) {
        flex-grow: 0;
        flex-shrink: 0;
    }
    >:nth-child(2) {
        flex-grow: 1;
        padding-left: 2.4rem;
    }
    /* margin-bottom: 2rem; */


` as any
export const ShortcutSection = styled.div`    
    border-bottom: 1px solid #333;
    >:nth-child(1) {
        margin-bottom: 1.5rem;
        padding: 2rem 4rem;
        font-size: 1.2em;
    }
    >:nth-child(2) {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }
    ${SettingItemWrap} {
        padding: 1.2rem ${xPad};
    }
`

export const SidebarSection = styled.div`
    &:not(:last-child) {
        margin-bottom: 1.5rem;
    }
    >:nth-child(1) {
        margin-bottom: 0.5rem;
    }
`
export const ToggleAndText = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 1.1em;
`
export const ModRow = styled.div`
    padding: 2em;
    border-bottom: 1px solid #262626;
    >:nth-child(2) {
        text-align: center;
    }
    >:nth-child(3) {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        > * {
            @media (max-width: 1199px) {
                width: 100%;
            }
            @media (min-width: 1200px) {
                width: 48%;
            }

        }
    }
    ${SettingItemWrap} {
        margin-top: 2rem;
    }
`
export const Indicator = styled.div`
    width: .3em;
    height: .3em;
    background: ${props => props.on ? 'green' : '#444'};
    display: inline-block;
    border-radius: 1000px;
`

export const Badge = styled.div`
    background: #bd8723;
    color: white;
    border-radius: .3em;
    display: inline-flex;
    padding: .1em .3em;
    font-size: 0.8em;
    margin-left: .5em;
`
export const SettingPath = styled.div`
    font-size: 0.8em;
    display: inline-block;
    color: #666;
    margin: 0.5rem 0;
`
export const ModContent = styled.div`
    display: flex;
    >:nth-child(1) {
        flex-grow: 1;
        /* padding: 2rem 4rem; */
    }
    >:nth-child(2) {
        width: 13rem;
        flex-shrink: 0;
        align-items: center;
        display: flex;
        justify-content: center;

    }
`

export const ModsWrap = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    overflow-y: auto;
`
export const ContentWrap = styled.div`
    position: relative;
`