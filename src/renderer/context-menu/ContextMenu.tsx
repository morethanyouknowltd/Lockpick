import React from 'react'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

export const HasContextMenu = ({ id, children, menuItems }) => {
    return <ContextMenuTrigger id={id}>
        {children}
        <ContextMenu id={id}>
            {menuItems.map(item => {
                // TODO support separators
                return <MenuItem key={item.label} onClick={item.click}>{item.label}</MenuItem>
            })}
        </ContextMenu>
    </ContextMenuTrigger>
}