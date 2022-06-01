import { Flex, Presser, Txt } from '../../core/components'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from '../../core/hooks/routerHooks'
import type { DevAction, DevContextType } from '../contexts/DevContext'
import DevContext from '../contexts/DevContext'
import type { DefaultNativeProps } from '../../native/MTYKNativeTypes'
import { config } from '../../core/helpers/config'

type LocalAction = DevAction & { id: number }
let nextId = 0

/**
 * Component to wrap all others that provides dev-specific actions
 * to speed up testing etc. Basically a debug view
 */
export default function DevExperience({
  children,
  disabled,
}: DefaultNativeProps & { disabled?: boolean }) {
  const history = useHistory()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [currActions, setCurrActions] = useState<LocalAction[]>([])

  useEffect(() => {
    if (location.pathname === '/') {
    }
  }, [location.pathname])

  const providerValue: DevContextType = {
    actions: currActions,
    provideActions: (actions) => {
      setCurrActions([
        ...currActions.filter((a) => {
          if (actions.find((_a) => _a.name === a.name)) {
            console.warn(
              `Created a duplicate dev action with name "${a.name}" (this may just be because of fast refresh)`
            )
            return false
          }
        }),
        ...actions.map((a) => {
          return {
            ...a,
            id: ++nextId,
          }
        }),
      ])
    },
    removeActions: (id) => {
      setCurrActions(currActions.filter((a) => a.componentId !== id))
    },
  }

  if (config.environment !== 'development' || disabled) {
    // Skip in production
    return children
  }

  return (
    <DevContext.Provider value={providerValue}>
      {children}
      <Flex
        as={Presser}
        onPress={() => {
          setOpen(!open)
        }}
        rowCenter
        gap={20}
        padding={[7, 15]}
        style={{
          shadowOpacity: 0.2,
          shadowOffset: { width: 0, height: -1 },
          shadowBlur: 1,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          position: 'absolute',
          right: 0,
          paddingRight: 20,
          bottom: 0,
          backgroundColor: 'white',
        }}
      >
        <Txt>{location.pathname}</Txt>
        {open ? (
          <Flex rowCenter gap={6}>
            <Presser
              style={{ fontSize: 14 }}
              onPress={() => {
                history.replace('/')
              }}
            >
              <Txt medium>Home</Txt>
            </Presser>
            {currActions.map((action) => {
              return (
                <Presser
                  key={action.id}
                  style={{ fontSize: 14 }}
                  onPress={action.fn}
                >
                  <Txt medium>{action.name}</Txt>
                </Presser>
              )
            })}
          </Flex>
        ) : null}
      </Flex>
    </DevContext.Provider>
  )
}
