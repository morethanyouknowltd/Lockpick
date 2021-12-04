/// <reference path="../lockpick-mod-api.d.ts" />
/**
 * @name Kitchen Sink
 * @description Actions still waiting to be converted to mods
 * @disabled
 * @category global
 */

getActions() {
    return {
        // GLOBAL
        ...(this.actionsWithCategory('global', {
            openTrackSearch: {
                action: () => {
                    // this.searchWindow.show()
                }
            },
            restoreAutomationControl: {
                action: () => {
                    Bitwig.makeMainWindowActive()
                    sendPacketToBitwig({type: 'action', data: 'restore_automation_control'})
                }
            },
            goBack: {
                description: 'Go back to the previous track in the selection history.',
                defaultSetting: {
                    keys: []
                },
                action: () => {
                    sendPacketToBitwig({type: 'tracknavigation/back'})
                }
            },
            goForward: {
                description: 'Go forward to the next track in the selection history.',
                defaultSetting: {
                    keys: []
                },
                action: () => {
                    sendPacketToBitwig({type: 'tracknavigation/forward'})
                }
            },
            focusArranger: {
                description: 'Focuses the arranger panel',
                action: () => {
                    // TODO can we get away with using the controller API for this in time for
                    // the next keypresses? Seems safer to use raw input but relies on
                    // having specific shortcuts set

                    Keyboard.keyPress('ArrowDown', {Control: true, Shift: true})
                    Keyboard.keyPress('ArrowLeft', {Control: true, Shift: true})
                    // Then move it back (because there is only "Toggle/Focus" not "Focus")
                    // If arranger is already active, it ends up showing the mixer...
                    Keyboard.keyPress('o', {Alt: true})
                }
            }
        })),

        // DEVICES
        ...(this.actionsWithCategory('devices', {
            navigateToParentDevice: {
                description: `Selects the parent device of the currently selected device.`,
                defaultSetting: {
                    keys: ['Meta', 'Shift', 'W']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'devices/selected/navigate-up'
                    })
                }
            },
            ...this.repeatActionWithRange('selectDeviceSlot', 1, 8, i => {
                return {
                    description: `Focuses slot ${i} of the currently selected device. Press a second time on an empty slot to insert a device.`,
                    defaultSetting: {
                        keys: ["Meta", String(i)]
                    },
                    action: () => sendPacketToBitwig({
                        type: 'devices/selected/slot/select',
                        data: i - 1
                    })
                }
            }),
            ...this.repeatActionWithRange('selectDeviceLayer', 1, 8, i => {
                return {
                    description: `Focuses layer ${i} of the currently selected device. Press a second time on an empty layer to insert a device. If the selected device does not have layers, selection will occur on the parent device instead (recursing up to a maximum of 5 device levels).`,
                    defaultSetting: {
                        keys: ["Meta", "Shift", String(i)]
                    },
                    action: () => sendPacketToBitwig({
                        type: 'devices/selected/layers/select',
                        data: i - 1
                    }),
                }
            }),
        })),

        // ARRANGER
        ...(this.actionsWithCategory('arranger', {

        })),

        // MISC
        ...(this.actionsWithCategory('misc', {
            fixBuzzing: {
                description: `Solos each track one-by-one to try and eliminate any buzzing noises that have somehow accumulated.`,
                defaultSetting: {
                    keys: ['F6']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'bugfix/buzzing'
                    })
                }
            }
        })),
    }
}
