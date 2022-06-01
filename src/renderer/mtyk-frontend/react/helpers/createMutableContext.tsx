import { isEqual, mapValues, omit, pick } from 'lodash'
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { useImmer } from 'use-immer'
import createContextUtils from './createContextUtils'

function makeImmerProvider<T extends object>(
  ProviderComponent: React.Provider<T>,
  immutableKeys: string[],
  opts: any = {}
) {
  return forwardRef(function ImmerContextProvider(
    {
      value,
      children,
      onChange,
    }: {
      children: any
      onChange?: (value: any) => void
      value: Omit<T, 'update'>
    },
    ref
  ) {
    const prevValue = useRef(value)
    const [mutablePartial, updateMutablePartial] = useImmer(
      omit(value, immutableKeys)
    )
    const immutable = pick(value, immutableKeys)

    useEffect(() => {
      if (!isEqual(value, prevValue.current)) {
        updateMutablePartial(ctx => {
          Object.assign(ctx, value)
          prevValue.current = value
          onChange?.(value)
        })
      } else {
        prevValue.current = value
      }
    }, [value, updateMutablePartial])

    const childUpdaters = mapValues(
      opts.childUpdaters ?? {},
      childUpdaterCreator => {
        return (...args: any[]) => {
          updateMutablePartial(root => {
            childUpdaterCreator(root)(...args)
          })
        }
      }
    )
    const valueProp = {
      ...immutable,
      ...value,
      ...mutablePartial,
      update: updateMutablePartial,
      ...childUpdaters,
    }

    useImperativeHandle(ref, () => ({
      get value() {
        return valueProp
      },
    }))

    return <ProviderComponent value={valueProp}>{children}</ProviderComponent>
  })
}

export default function createMutableContext<
  I extends object,
  M extends object
>(immutable: I, mutable: M = undefined as any, opts: any = {}) {
  const toReturn = createContextUtils<
    I & M & { update: (cb: (m: M) => void) => void }
  >(immutable as any)
  return {
    ...toReturn,
    provider: makeImmerProvider(
      toReturn.provider,
      Object.keys(immutable),
      opts
    ),
  }
}
