import { styled } from 'linaria/react'

export const SettingsIcon = styled.div`
    font-size: 1.1em;
    color: #777;
    border: 1px solid transparent;
    padding: .4em;
    &:hover {
        /* color: #fff; */
        border-color: #222;
        background: #444;
    }
    &:active {
        background: #222;
    }
    border-radius: .5em;
    cursor: pointer;
    
    margin-right: 2rem;

`

export const Select = styled.select`
    background: #333;
    border: 1px solid #222;
    border-radius: .3em;
    color: #909090;
    &:focus {
        outline: none;
        border-color: #888;
    }
    padding: 0.2em 0.6em;
`
export const Footer = styled.div`
    display: flex;
    user-select: none;
    padding: 0 1.5rem;
    align-items: center;
    justify-content: space-between;
    background: #111;
    border-top: 1px solid black;
    -webkit-app-region: drag; 
    font-size: .8em;
    height: 2.8rem;
    > * {
        -webkit-app-region: no-drag; 
        /* margin-left: 1rem; */
    }
`

export const VersionInfoWrap = styled.div`

    display: flex;
    align-items: center;
    >*{
        margin-right: 1em;
    }
    button {
        font-size: .9em;
    }
`