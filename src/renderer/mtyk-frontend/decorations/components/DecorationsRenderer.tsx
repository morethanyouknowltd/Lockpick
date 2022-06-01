import { Presser } from 'mtyk-frontend/core/components'
import { config } from 'mtyk-frontend/core/helpers/config'
import useDimensions from 'mtyk-frontend/styles/hooks/useDimensions'
import React, { useState } from 'react'
import Flex from '../../core/components/Flex'
import type {
  DecorationsContextType,
  InjectedModalProps,
} from '../../decorations/contexts/DecorationsContext'
import useDecorationsContext, {
  DecorationsContext,
} from '../../decorations/contexts/DecorationsContext'

/**
 * Responsible for coordinating all fullscreen-ish things. Easier to manage
 * when most of this is in the same place
 *
 * Should be a parent of all other views so it can manage rendering fullscreen
 * content in front
 */
export default function DecorationsRenderer({ children }: { children: any }) {
  const [decorationsContext, setDecorationsContext] = useState<
    Partial<DecorationsContextType>
  >({})
  const { modal: Modal, props: modalProps } = decorationsContext
  const [dirty, setDirty] = useState(false)
  const parentcontext = useDecorationsContext()
  const dimensions = useDimensions()
  const defaults: InjectedModalProps = {
    setDirty,
    close: () => {
      if (
        dirty &&
        !window.confirm('Are you sure you want to discard any unsaved changes?')
      ) {
        return
      }

      if (JSON.stringify(decorationsContext) === '{}') {
        parentcontext?.close()
      } else {
        setDecorationsContext({})
        setDirty(false)
      }
    },
  }

  return (
    <DecorationsContext.Provider
      value={{
        ...decorationsContext,
        ...defaults,
        setDecorationsContext,
      }}
    >
      {children}
      {Modal ? (
        <Flex
          {...(decorationsContext.tapBackgroundToClose ? { as: Presser } : {})}
          onPress={(event: { target: HTMLElement }) => {
            if (!decorationsContext.tapBackgroundToClose) {
              return
            }
            if (config.isNative) {
              defaults.close()
            } else if (event.target.id === 'modalwrap') {
              defaults.close()
            }
          }}
          center
          style={{
            top: 0,
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: dimensions.width,
            backgroundColor: decorationsContext.tapBackgroundToClose
              ? 'rgba(0, 0, 0, 0.4)'
              : undefined,
          }}
        >
          <Modal {...defaults} {...modalProps} />
        </Flex>
      ) : null}
    </DecorationsContext.Provider>
  )
}
