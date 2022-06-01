import React, { useLayoutEffect } from 'react'
import { FallbackProps } from 'react-error-boundary'

export interface divErrorBoundaryProps<P> extends FallbackProps {
  ErroredComponent: React.ComponentType<P>
  erroredProps: P
}
export default function createdivErrorBoundary({}: // div,
{
  // div: typeof divType
}) {
  /** Renders the error, message, stack trace and component hierarchy */
  function RenderError({ error }: { error: Error }) {
    // Hides the nextjs error component
    useLayoutEffect(() => {
      // setTimeout(() => {
      //   try {
      //     document
      //       .querySelector(`nextjs-portal`)
      //       .shadowRoot.querySelector(
      //         '[data-nextjs-dialog-overlay]'
      //       ).style.display = 'none'
      //   } catch (e) {}
      // }, 100)
    }, [])
    return (
      <div>
        <div>
          <span>{error.message}</span>
          <span style={{ whiteSpace: 'pre-wrap' }}>{error.stack}</span>
        </div>
        {'componentStack' in error ? (
          <div>
            <h2>Component hierarchy</h2>
            <div>
              {error.componentStack.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  function ReactComponentName({ Component }: { Component: React.ReactNode }) {
    if (typeof Component === 'string') {
      return Component
    }
    if (typeof Component === 'function') {
      return Component.displayName || Component.name || 'Component'
    }
    return typeof Component
  }

  return function divErrorBoundary<P>(props: divErrorBoundaryProps<P>) {
    const { ErroredComponent, erroredProps, error, resetErrorBoundary } = props

    // If the original component was div, hopefully we can trust the styles will still look okay, so keep them from the props
    const style = {
      ...(ErroredComponent === div ? erroredProps.style : {}),
      background: 'red',
      color: 'white',
    }
    return (
      <div style={style}>
        Error in <ReactComponentName Component={ErroredComponent} />
        <RenderError error={error} />
      </div>
    )
  }
}
