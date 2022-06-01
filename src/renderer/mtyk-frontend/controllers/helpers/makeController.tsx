import assert from 'mtyk-frontend/core/helpers/assertDefined'
import { isObjectLike } from 'mtyk-frontend/types/helpers/isX'
import React, { useRef } from 'react'

export default function makeController<
  Fn extends (props: Props) => ProvidedProps,
  Props = any,
  ProvidedProps = any
>(getControllerApiFn: Fn) {
  function ControllerComponent(props: { Renderer: React.ComponentType }) {
    const { Renderer, ...rest } = props ?? {}
    const api = getControllerApiFn(rest)
    assert(isObjectLike(api), 'getControllerApiFn must return an object')
    return (
      <>
        <Renderer {...api} {...rest} />
      </>
    )
  }
  ControllerComponent.use = ((...args) => {
    const api = (getControllerApiFn as any)(...args)
    assert(
      typeof api === 'object' && api !== null,
      `Expected getControllerApiFn to return an object, got ${api}`
    )

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ref = useRef(api) // just so we can view in dev tools
    Object.assign(ref.current, api)
    return ref.current
  }) as Fn
  return ControllerComponent
}

export type ViewControllerProps<T extends { use: (props: any) => any }> = ReturnType<T['use']>
