import { useHistory, useLocation } from '../hooks/routerHooks'

interface NavigationItem {
  href: string
  exact?: boolean
  /** Force the value to be active */
  isActive?: boolean
  extraActivePrefixes?: string[]
}

/**
 * Useful for nav that should stay `active` when nested routes are active. Just
 * returns navigation with extra `isActive` property
 */
export default function useNavigation<I extends NavigationItem>(
  items: I[],
  { location: _location, history: _history, exact }: any = {}
) {
  const location = _location ?? useLocation()
  const history = _history ?? useHistory()
  return items.map(item => {
    const { href, extraActivePrefixes } = item
    const isActive =
      item.isActive ||
      [href, ...(extraActivePrefixes ?? [])].some(str => {
        return str === '/'
          ? location.pathname === '/'
          : exact || item.exact
          ? str === location.pathname
          : location.pathname.indexOf(str ?? '') === 0
      })
    const hrefWithData = href.replace(/\[[a-zA-Z]+\]/g, (match: string) => {
      return location.query[match.replace(/\[|\]/g, '')]
    })
    return {
      isActive,
      toggle: () => {
        if (isActive) {
          history.push('/')
        } else {
          history.push(hrefWithData)
        }
      },
      replace: () => history.replace(hrefWithData),
      push: () => history.push(hrefWithData),
      ...item,
      href: hrefWithData,
    }
  })
}
