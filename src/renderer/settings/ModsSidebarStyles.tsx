import { styled } from 'linaria/react'

export const TopHalf = styled.div`
    -webkit-app-region: drag;
    padding: 1.5em;
    > * {
        -webkit-app-region: no-drag;
    }
`

export const SidebarSectionWrap = styled.div`
    &:not(:last-child) {
        margin-bottom: 1.5rem;
    }
`

export const SidebarItemWrap = styled.div`
    font-size: .9em;
    white-space: nowrap;
    margin-bottom: .35rem;
    user-select: none;
    
    &:hover {
        cursor: pointer;
        color: ${(props: any) => props.focused ? '#CCC' : '#AAA'};
    }
    color: ${(props: any) => ((props.valid === false || props.error) ? 'red' : (props.focused ? '#CCC' : '#717171'))};
`