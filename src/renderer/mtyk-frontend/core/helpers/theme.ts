import _ from 'lodash'

export const defaultTheme = {
  background: `#F3F6F9`,
  // colors
  primary: '#2f536d',
  primaryAlt: `#9fd7ff`,
  primaryAltBright: `#2593de`,
  primaryLighter: `#EAF5FF`,
  primaryLightest: `#F3F6F9`,

  selected: `#f2f9ff`,
  selected2: `#9bcbf5`,
  secondary: '#c6dbea',

  textNeutralDark: `#4e4e4e`,
  textNeutralDarkest: `#222`,

  textDarkest: `#233a50`,
  textDark: `#4d5c6b`,
  textLightest: `#6c9ec2`,
  textMedium: '#555',
  textInactive: '#bbb',

  // spacing
  paddingWindowX: `2.5rem`,
  paddingContentBoxY: `1.6rem`,
  paddingContentBoxX: `2.2rem`,

  widthInput: `13.4em`,
}

const out = _.mapValues(
  defaultTheme,
  (value, key) => (props) => props.theme[key]
) as {
  [K in keyof typeof defaultTheme]: (props: any) => any
}
export const {
  background,
  primary,
  primaryAlt,
  primaryAltBright,
  primaryLighter,
  primaryLightest,
  selected,
  selected2,
  secondary,
  textNeutralDarkest,
  textNeutralDark,
  textDarkest,
  textDark,
  textLightest,
  textMedium,
  textInactive,
  paddingWindowX,
  paddingContentBoxY,
  paddingContentBoxX,
  widthInput,
} = out
//

export const themed = out
export default defaultTheme
