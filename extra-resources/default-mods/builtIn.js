/**
 * @name Built-in Actions
 * @id built-in
 * @description Shortcuts built-in to Bitwig. Adding a shortcut here has the benefit of working even when VST windows are focused.
 * @category global
 * @creator More Than You Know
 */

const savedData = await Db.getData()
let actions = []

if (Bitwig.connected && !savedData.lastUpdatedActions || new Date().getTime() - new Date(savedData.lastUpdatedActions).getTime() > 1000 * 60 * 60 * 24 * 7) {
    // If it's been a week since last call to Bitwig, update actions. Would be 
    // better if we could check running BW version, but this will do for now
    actions = (await Bitwig.sendPacketPromise({type: 'actions'})).data
    await Db.setData({
        lastUpdatedActions: new Date().getTime(),
        actions
    })
} else {
    actions = savedData.actions || []
}

const categoryMap = {}
function categoryIfNotExist(cat) {
    if (!(cat in categoryMap)) {
        categoryMap[cat] = Mod.registerActionCategory({title: cat})
    }
    return categoryMap[cat]
} 

for (const action of actions) {
    Mod.registerAction({
        id: action.id,
        title: action.name,
        contexts: action.name.toLowerCase().indexOf('record') >= 0 ? ['-browser'] : undefined, 
        description: action.description,
        category: categoryIfNotExist(action.category),
        action: () => {
            Bitwig.runAction(action.id)
        }
    })
}