import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { Flex } from '../../../core/components'
import Transitionable from '../../../native/animation/components/Transitionable'
import { unifyStyles } from '../../../react/helpers/unifyStyle'

let newIndex = 0
let defaultTransition

type AnimatedElement = {
  element: any
  key: string
  exitAt?: number
  offAt?: number
  newIndex: number
}

/**
 * Currently this only really works well with absolutely positioned children, as we don't do anything
 * smart to maintain indexes
 */
function TransitionManager({
  enter,
  on,
  exit,
  duration,
  children,
  style,
  ...rest
}: any) {
  const reactChildren = React.Children.toArray(children)
  const reactChildrenKeys = React.Children.toArray(children).map((c) => c.key)
  const [animatedChildren, setAnimatedChildren] = useState<{
    elements: AnimatedElement[]
  }>({
    elements: [],
  })

  useEffect(() => {
    //
    const newChildren = _.differenceBy(
      reactChildren,
      animatedChildren.elements,
      (e) => e.key
    )
    const goneKeys = _.differenceBy(
      animatedChildren.elements,
      reactChildren,
      (e) => e.key
    ).map((e) => e.key)
    //
    let currElementsByKey = _.keyBy(animatedChildren.elements, 'key')
    reactChildren.forEach((child) => {
      // make sure child elements are up to date
      if (typeof child === 'object' && child.key in currElementsByKey) {
        currElementsByKey[child.key].element = child
      }
    })

    // console.log({ newChildren, goneKeys })
    const thisNewIndex = ++newIndex
    const now = new Date().getTime()

    setAnimatedChildren({
      elements: [
        ...animatedChildren.elements,
        ...newChildren.map((child) => {
          return {
            element: child,
            key: child.key,
            newIndex: thisNewIndex,
          } as AnimatedElement
        }),
      ]
        .map((el) => {
          // if (el.newIndex === newIndex) {
          //   return el
          // }
          // Gone children just hang around until the next run on the fn
          // This component is only build for a small number of els so not a big deal
          if (!el.offAt && goneKeys.indexOf(el.key) >= 0) {
            el.exitAt = now
            el.offAt = now + duration
          }
          return el
        })
        .filter((el) => {
          // if (el.newIndex === newIndex) {
          //   return true
          // } else
          if (el.offAt) {
            return el.offAt < now
          }
          return true
        }),
    })
  }, [children])

  return (
    <Flex style={[...unifyStyles(style ?? {})]} {...rest}>
      {animatedChildren.elements.map((child) => {
        const { element, offAt, exitAt, key } = child
        return (
          <Transitionable
            {...{
              key,
              ...(defaultTransition || {}),
              offAt,
              exitAt,
              duration,
              enter,
              on,
              exit,
              id: key,
            }}
          >
            {element}
          </Transitionable>
        )
      })}
    </Flex>
  )
}

export default TransitionManager
export function setDefaultTransition(transition: any) {
  defaultTransition = transition
}

export const Transitions = {
  slideHorizontal: {
    exit: {
      translateX: '-100%',
      opacity: 0,
    },
    on: {
      translateX: 0,
      opacity: 1,
    },
    enter: {
      translateX: '100%',
      opacity: 0,
    },
    duration: 300,
  },
  slideUpSubtle: {
    exit: {
      translateY: -20,
      opacity: 0,
    },
    on: {
      translateY: 0,
      opacity: 1,
    },
    enter: {
      translateY: 20,
      opacity: 0,
    },
    duration: 300,
  },
  slideUp: (amount = 20, duration = 300) => {
    return {
      exit: {
        translateY: amount,
        opacity: 0,
      },
      on: {
        translateY: 0,

        opacity: 1,
      },
      enter: {
        translateY: amount,

        opacity: 0,
      },
      duration,
    }
  },
  slideUpAndScale: {
    exit: {
      translateY: -20,
      scale: 0.5,
      opacity: 0,
    },
    on: {
      translateY: 0,
      scale: 1,
      opacity: 1,
    },
    enter: {
      translateY: -20,
      scale: 0.5,
      opacity: 0,
    },
    duration: 300,
  },
  fade: {
    exit: {
      opacity: 0,
    },
    on: {
      opacity: 1,
    },
    enter: {
      opacity: 0,
    },
    duration: 300,
  },
}
