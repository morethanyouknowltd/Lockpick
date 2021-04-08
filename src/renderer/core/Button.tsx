import React from 'react'
import { styled } from 'linaria/react'

const ButtonStyle = styled.button`
-webkit-appearance: none;
background: ${(props: any) => props.secondary ? `#232323` : `#473f89`};
color: white;
font-size: .9em;
padding: .5em 2em;
border: 1px solid ${(props) => props.secondary ? `#111` : `#200f40`};
&:active {
    background: ${(props) => props.secondary ? `#111` : `#200f40`};
}
margin: 0 auto;
display: block;
cursor: pointer;   
outline: none !important;
&:disabled {
    cursor: not-allowed;
    background: #666;
    opacity: .5;
}
&:hover:not(:disabled) {
    filter: brightness(85%);
}
border-radius: .2em;
`
export const Button = ({ children, link, ...rest }: { link?: string, children: any } & any) => {
    if (link) {
        return <a href={link}><ButtonStyle {...rest}>{children}</ButtonStyle></a>
    } 
    return <ButtonStyle {...rest}>{children}</ButtonStyle>
}