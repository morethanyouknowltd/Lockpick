import { useEffect, useState } from 'react'
import makeController from 'mtyk-frontend/controllers/helpers/makeController'

interface Idable {
  _id: string
}

const defaultSidebarSelectorOptions = {
  autoSelectFirst: true,
  shouldSelectItem: async item => true,
  onSelectionChanged: item => {},
} as const

type ArraySelectionOptions = typeof defaultSidebarSelectorOptions
type ArraySelectionController<T extends Idable> = {
  items: T[]
} & Partial<ArraySelectionOptions>

export default makeController(function SidebarSelectorContoller<T extends Idable>(
  props: ArraySelectionController<T>
) {
  const { items, autoSelectFirst, shouldSelectItem, onSelectionChanged } = {
    ...defaultSidebarSelectorOptions,
    ...props,
  }
  const [selectedItem, _setSelectedItem] = useState<T>()
  const setSelectedItem = async (item: T, bypass?: boolean) => {
    if (bypass || (await shouldSelectItem(item))) {
      _setSelectedItem(item)
      onSelectionChanged?.(item)
    }
  }

  const selectedIndex = items.findIndex(item => item._id === selectedItem?._id)
  const liveSelectedItem = items.find(item => item._id === selectedItem?._id)

  function itemNoLongerExists() {
    return selectedItem && selectedIndex === -1
  }

  useEffect(() => {
    if (autoSelectFirst && ((!selectedItem && items.length > 0) || itemNoLongerExists())) {
      setSelectedItem(items[0], true)
    }
  }, [autoSelectFirst, items.length, selectedIndex])

  function findIndex(item: T) {
    return items.findIndex(({ _id }) => _id === item._id)
  }
  function canSelectNext() {
    return selectedItem && selectedItem !== items[items.length - 1]
  }
  function canSelectPrevious() {
    return selectedItem && selectedItem !== items[0]
  }
  function isItemSelected(item) {
    return selectedItem ? item._id === selectedItem._id : false
  }
  async function selectNext() {
    if (canSelectNext() && selectedItem) {
      setSelectedItem(items[findIndex(selectedItem) + 1])
    }
  }
  async function selectPrevious() {
    if (canSelectPrevious() && selectedItem) {
      setSelectedItem(items[findIndex(selectedItem) - 1])
    }
  }

  const api = {
    selectedItem: liveSelectedItem,
    selectedIndex,
    setSelectedItem,
    isItemSelected,
    items,
    selectNext,
    selectPrevious,
    canSelectNext,
    canSelectPrevious,
  }
  return api
})
