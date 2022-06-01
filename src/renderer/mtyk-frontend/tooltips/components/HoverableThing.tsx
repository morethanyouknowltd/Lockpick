import React, { cloneElement } from 'react'
import { usePopperTooltip } from 'react-popper-tooltip'
import { config } from '../../core/helpers/config'
const HoverableThing = ({
  options,
  children,
  allowTooltipHover,
  noArrow,
  tooltip,
  tooltipStyle,
}: {
  options?: Parameters<typeof usePopperTooltip>[0]
  children: any
  noArrow?: boolean
  allowTooltipHover?: boolean
  tooltip: any
  tooltipStyle?: any
}) => {
  const {
    getArrowProps,
    getTooltipProps,
    setTooltipRef,
    setTriggerRef,
    tooltipRef,
    visible,
  } = usePopperTooltip({ ...options, interactive: allowTooltipHover })

  // let visible = true
  const tooltipProps = getTooltipProps({
    className: 'tooltip-container',
  })
  if (!('transform' in tooltipProps.style)) {
    tooltipProps.style.opacity = 0
  } else {
    tooltipProps.style.opacity = 1
  }
  let transformedChild = children
  if (typeof transformedChild !== 'function') {
    // clone the child element to provide a ref to it

    const clonedChild = cloneElement(React.Children.only(children), {
      ref: setTriggerRef,
    })
    transformedChild = clonedChild
  } else {
    transformedChild = React.createElement(transformedChild, {
      ref: setTriggerRef,
    })
  }

  return (
    <>
      {transformedChild}
      {tooltip && visible && (
        <div
          ref={setTooltipRef}
          {...tooltipProps}
          // Reset font size for browser so tooltip doesn't inherit size
          style={{
            ...tooltipProps.style,
            fontSize: config.isNative ? undefined : '.92rem',
            fontWeight: '500',
            width: 'max-content',
            ...tooltipStyle,
          }}
        >
          {tooltip}
          {!noArrow && (
            <div {...getArrowProps({ className: 'tooltip-arrow' })} />
          )}
        </div>
      )}
    </>
  )
}

export { HoverableThing }
export default HoverableThing
