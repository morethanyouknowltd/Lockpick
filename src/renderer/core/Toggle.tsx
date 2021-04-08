import React, { useState } from 'react'
import { styled } from 'linaria/react'

export const toggleHeight = 1.1
export const ToggleStyle = styled.div`
    width: ${toggleHeight * 2.4}em;
    height: ${toggleHeight}em;
    border-radius: 1000px;
    position: relative;
    font-size: .9em;
    transition: all .5s;
    background: ${(props: any) => !props.value ? `#333` : 'linear-gradient(176deg, #73d976, #2e9b2c)'};
    cursor: pointer;
    &:after {
        content: "";
        position: absolute;
        width: ${toggleHeight * 1.1}em;
        height: ${toggleHeight * 1.1}em;
        background: linear-gradient(177deg, white, #636363);
        /* border: 1px solid #8d8d8d; */
        border-radius: 1000px;
        transition: all .5s;
        transform: translateY(-9%);
        right: ${(props: any) => props.value ? '0' : '60%'};
    }

` as any

export const Toggle = ({value, onChange, ...rest}: any) => {
    const onClick = () => {
        onChange(!value)
    }
    return <ToggleStyle className="toggle" onClick={onClick} value={value} {...rest} />
}