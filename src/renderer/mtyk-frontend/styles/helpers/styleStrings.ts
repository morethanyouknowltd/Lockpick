import { isNumber } from 'lodash'
import invariant from 'tiny-invariant'

export const absoluteFill = `
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`
export const absoluteCenter = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`
export const allCorners = (inset: number) => `
    top: ${inset};
    left: ${inset};
    bottom: ${inset};
    right: ${inset};
`
export const flexBetween = `display: flex; justify-content: space-between;`

export function em(value: number): string {
  invariant(isNumber(value), `Expected value to be a number, got ${value}`)
  return value + 'em'
}

export function px(value: number): string {
  invariant(isNumber(value), `Expected value to be a number, got ${value}`)
  return `${value}px`
}
