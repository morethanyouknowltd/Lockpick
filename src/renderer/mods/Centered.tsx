import React from 'react'
import { styled } from 'linaria/react'

const CenteredWrap = styled.div`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
`

export const Centered = ({children}) => {
    return <CenteredWrap>
        <div>
            {children}
        </div>
    </CenteredWrap>
}