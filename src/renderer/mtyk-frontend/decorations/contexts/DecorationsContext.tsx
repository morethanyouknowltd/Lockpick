import type React from 'react'
import { ComponentType, createContext, useContext } from 'react'
export interface ModalOpenProps {}

/**
 * @deprecated Prefer using the DecorationsContext inside components rather than
 *   passing props down
 */
export interface InjectedModalProps {
  /**
   * If the user attempts to close the modal while this flag is known to be
   * true, the user will be warned about lost changes
   */
  setDirty: (dirty: boolean) => void
  close: (force?: boolean) => void
}

export interface DecorationsContextType extends InjectedModalProps {
  modal?: React.ComponentType<any>
  tapBackgroundToClose?: boolean
  props?: any

  /**
   * Determines how the main content will slide down when a decoration is
   * opened. Defaults to `slide-down`
   */
  contentTransitionStyle?: 'slide-down' | 'zoom-out'
  setDecorationsContext: (ctx: Partial<DecorationsContextType>) => void
}

export const DecorationsContext = createContext<DecorationsContextType>({
  setDecorationsContext: () => {}, // provider must impl
  close: (force?: boolean) => {},
  setDirty: (dirty: boolean) => {},
})

export default function useDecorationsContext() {
  const context = useContext(DecorationsContext)
  return {
    ...context,
    openModal: (
      component: ComponentType<any>,
      props: any,
      opts?: Partial<DecorationsContextType>
    ) => {
      context.setDecorationsContext({
        modal: component,
        props,
        ...opts,
      })
    },
  }
}
