import { uniqBy } from 'lodash'
import assert from 'mtyk-frontend/core/helpers/assertDefined'
import makeController from 'mtyk-frontend/controllers/helpers/makeController'
import ArraySelectionController from './ArraySelectionController'
import { MTYKIcon } from 'mtyk-frontend/core/components/Icon'

export interface TabControllerProps {
  tabs: (Record<string, any> & { label: string; icon?: MTYKIcon })[]
}

export default makeController(function TabController(props: TabControllerProps) {
  const { tabs } = props
  assert(uniqBy(tabs, 'label').length === tabs.length, 'Tabs must have unique labels')
  const arraySelectionController = ArraySelectionController.use({
    items: tabs.map(tab => ({ ...tab, _id: tab.label })),
  })
  const api = {
    ...arraySelectionController,
    tabs: arraySelectionController.items.map(item => {
      return {
        ...item,
        key: item._id,
        isActive: arraySelectionController.isItemSelected(item),
        action: () => {
          arraySelectionController.setSelectedItem(item)
        },
      }
    }),
  } as const
  return api
})
