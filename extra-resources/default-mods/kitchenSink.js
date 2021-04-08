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
            enterGroup: {
                description: 'Enters the currently selected group track',
                defaultSetting: {
                    keys: ['Meta', 'Control', 'S']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'action',
                        data: [
                            `focus_track_header_area`,
                            `Enter Group`,
                            `select_track1`
                        ]
                    })
                }
            },
            exitGroup: {
                description: 'Exits the currently entered group track',
                defaultSetting: {
                    keys: ['Meta', 'Control', 'W']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'action',
                        data: [
                            `focus_track_header_area`,
                            `Exit Group`,
                            `select_track1`
                        ]
                    })
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
            focusDevicePanel: {
                description: "Just focus the device panel, rather than the toggle/focus behaviour built into Bitwig.",
                defaultSetting: {
                    keys: ['D']
                },
                contexts: ['-browser'],
                action: () => {
                    sendPacketToBitwig({
                        type: 'action',
                        data: [
                            `focus_or_toggle_detail_editor`,
                            `focus_or_toggle_device_panel`
                        ]
                    })
                }
            },
            selectFirstDevice: {
                description: `Select the first device for the currently selected device chain.`,
                defaultSetting: {
                    keys: ['Meta', '§']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'devices/selected/layer/select-first'
                    })
                }
            },
            selectFirstTrackDevice: {
                description: `Select the first device for the currently selected track.`,
                defaultSetting: {
                    keys: []
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'tracks/selected/devices/select-first'
                    })
                }
            },
            selectLastDevice: {
                description: `Select the last device for the currently selected device chain.`,
                defaultSetting: {
                    keys: []
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'devices/selected/layer/select-last'
                    })
                }
            },
            insertDeviceAtStart: {
                defaultSetting: {
                    keys: ['Control', 'Q']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'devices/selected/chain/insert-at-start'
                    })
                }
            },
            insertDeviceAtEnd: {
                defaultSetting: {
                    keys: ['Control', 'E']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'devices/selected/chain/insert-at-end'
                    })
                }
            },
            collapseSelectedDevice: {
                description: `Close the main panel and remote controls page of the currently selected device. ${MODS_MESSAGE}`,
                defaultSetting: {
                    keys: ['Meta', '[']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: `devices/selected/collapse`
                    })
                },
            },
            expandSelectedDevice: {
                description: `Expand the main panel of the selected device. ${MODS_MESSAGE}`,
                defaultSetting: {
                    keys: ['Meta', ']']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: `devices/selected/expand`
                    })
                },
            },
            collapseAllDevicesInChain: {
                description: `Close the main panel and remote controls page of all devices in the currently selected chain. ${MODS_MESSAGE_2}`,
                defaultSetting: {
                    keys: ['Meta', 'Shift', '[']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: `devices/chain/collapse`
                    })
                },
            },
            expandAllDevicesInChain: {
                description: `Expand the main panel of all devices in the currently selected chain. ${MODS_MESSAGE_2}`,
                defaultSetting: {
                    keys: ['Meta', 'Shift', ']']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: `devices/chain/expand`
                    })
                },
            },
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
            toggleLargeTrackHeight: {
                description: `Toggles large track height, ensuring the arranger is focused first so the shortcut works when expected.`,
                defaultSetting: {
                    keys: ['Shift', 'C']
                },
                action: () => {
                    sendPacketToBitwig({
                        type: 'action',
                        data: [
                            'focus_track_header_area',
                            'toggle_double_or_single_row_track_height'
                        ]
                    })
                }
            },
            focusTrackHeaderArea: {
                defaultSetting: {
                    keys: ['T']
                },
                contexts: ['-browser'],
                action: () => {
                    sendPacketToBitwig({type: 'action', data: 'focus_track_header_area'})
                    Bitwig.makeMainWindowActive()
                } 
            },
            scrollSelectedTrackInView: {
                defaultSetting: {
                    keys: ['T'],
                    doubleTap: true
                },
                action: () => {
                    sendPacketToBitwig({type: 'track/selected/scroll'})
                } 
            },
            locatePlayhead: {
                defaultSetting: {
                    keys: ['F']
                },
                description: 'Scrolls the arranger to the currently playing position',
                action: () => {
                    sendPacketToBitwig({
                        type: 'action',
                        data: [
                            'toggle_playhead_follow'
                        ]
                    })
                    setTimeout(() => {
                        sendPacketToBitwig({
                            type: 'action',
                            data: [
                                'toggle_playhead_follow'
                            ]
                        })
                    }, 100)
                }
            }
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