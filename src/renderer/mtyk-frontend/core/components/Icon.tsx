import type { DefaultNativeProps } from 'mtyk-frontend/native/MTYKNativeTypes'
import { nativeOrWeb } from 'mtyk-frontend/react/nativeProps'
import React, { ComponentType, forwardRef } from 'react'
import { isObjectLike } from '../../types/helpers/isX'
import { FontAwesomeIcon } from '../helpers/conditionalImports'

export type IconPathData = string | string[]
export interface IconLookup {
  prefix: 'fas' | 'fab' | 'far' | 'fal' | 'fad'
  iconName: string
}
export interface IconDefinition extends IconLookup {
  icon: [
    number, // width
    number, // height
    string[], // ligatures
    string, // unicode
    string | string[] // svgPathData
  ]
}

export type MTYKIcon = IconDefinition | ComponentType<any>

function Icon(
  {
    icon,
    size,
    ...rest
  }: {
    icon: IconDefinition | string | React.ComponentType<any>
    color?: string
    size?: string | number
  } & DefaultNativeProps,
  ref
) {
  if (
    (isObjectLike(icon) &&
      'prefix' in icon &&
      typeof icon.prefix === 'string') ||
    typeof icon === 'string'
  ) {
    // Font awesome icon probably
    return (
      <FontAwesomeIcon
        icon={icon}
        size={size}
        {...rest}
        style={{ fontSize: size, ...rest.style }}
        ref={ref}
      />
    )
  }
  // Hopefully it's a component
  const IconComponent = icon as React.ComponentType<any>

  return (
    <IconComponent
      {...rest}
      style={{
        ...nativeOrWeb({ height: [undefined, '1em'] }),
        fontSize: size,
        ...rest.style,
      }}
      ref={ref}
    />
  )
}

export default forwardRef(Icon)
