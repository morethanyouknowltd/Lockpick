import { styled } from 'linaria/react'

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