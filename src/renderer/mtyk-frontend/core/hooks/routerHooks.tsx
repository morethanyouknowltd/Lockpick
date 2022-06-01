import React, { useEffect } from 'react'
import { ReactRouterNative, NextRouter } from '../helpers/conditionalImports'
import { config } from '../helpers/config'

const isNative = () => config.isNative

export function useHistory() {
  return isNative() ? ReactRouterNative.useHistory() : NextRouter.useRouter()
}
export function useLocation() {
  return isNative() ? ReactRouterNative.useLocation() : NextRouter.useRouter()
}
export function Router() {
  return useRouter()
}
export function useRouter() {
  if (config.isReactPreview) {
    return {
      pathname: '/preview',
      asPath: '/preview',
      query: {},
    }
  }
  return isNative() ? ReactRouterNative.useHistory() : NextRouter.useRouter()
}

export const NestedRoute = ({ ...params }) => {
  const loc = useLocation()
  return (
    <ReactRouterNative.Route
      {...params}
      path={`${loc.pathname}/${params.path}`}
    />
  )
}

export const Redirect = ({ to, ...rest }: { to: string }) => {
  if (isNative()) {
    return <ReactRouterNative.Redirect to={to} {...rest} />
  } else {
    const router = useHistory()
    useEffect(() => {
      router.replace(to)
    }, [])
    return null
  }
}

const DefaultRouter = NextRouter.Router ?? ReactRouterNative.NativeRouter
export const { NativeRouter, Switch, Route } = ReactRouterNative

export default DefaultRouter
