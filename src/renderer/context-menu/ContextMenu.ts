import { sendPromise } from "../bitwig-api/Bitwig";

const contextMenu = require('electron-context-menu');

interface ContextMenuContent {
    type: 'mod'
    data: any
}

let contextMenuContext: ContextMenuContent | undefined
export const setContextMenuContent = (content: ContextMenuContent) => {
    contextMenuContext = content
}

contextMenu({
	prepend: (defaultActions, parameters, browserWindow) => {
        console.log('context is ', contextMenuContext)
        if (contextMenuContext) {
            const { type, data } = contextMenuContext
            if (type === 'mod') {
                const mod = data
                return [
                    {
                        label: 'Reset to default settings',
                        visible: true,
                        click: async () => {
                            await sendPromise({
                                type: 'api/mod/action',
                                data: {
                                    action: 'resetToDefault',
                                    id: mod.id
                                }
                            })
                        }
                    }
                ]
            }
            contextMenuContext = null
        } else {
            console.log('context is WUT', contextMenuContext)
            return [
                {label: 'test', visible: true, click: () => {}}
            ]
        }
    }
});