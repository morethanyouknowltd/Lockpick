/**
 * @name Global Shortcuts
 * @id global-shortcuts
 * @description Misc global shortcuts.
 */

 Mod.registerAction({
    title: 'Focus Inspector*',
    id: 'focus-inspector',
    description: `Always focuses inspector, does not toggle.`,
    action: () => {
        log(UI.layout)
        Bitwig.sendPacket({
            type: 'action',
            data: [
                `Focus panel to the ${UI.layout === 'Single Display (Large)' ? 'right' : 'left'}`,
                'focus_or_toggle_inspector'
            ]
        })
    }
})