/**
 * @name Lockpick
 * @description Meta actions
 * @id lockpick
 * @category global
 * @author More Than You Know
 */

Mod.registerAction({
    title: `Open Lockpick Preferences`,
    id: "open-preferences",
    action: () => {
        Mod.runAction('open-preferences-internal')
    },
    defaultSetting: {
        keys: ["Meta", "Shift", ","]
    }
})