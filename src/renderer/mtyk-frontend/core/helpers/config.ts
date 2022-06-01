import _, { fromPairs } from 'lodash'
import isNative from './isNative'
export interface MTYKFrontendConfig {
  isNative: boolean
  isReactPreview?: boolean
  environment: 'development' | 'staging' | 'production'
  apiUrl: string
  rootUrl: string
  fontMap?: { [weight: number]: string }

  /**
   * Pass the raw map of fonts from the exported asset. Automatically converts
   * and populate fontMap
   */
  fonts: { [key: string]: number }
}

let _config: MTYKFrontendConfig = {
  isNative,
  apiUrl: '',
  rootUrl: '',
  fontMap: {},
  environment: 'development',
  fonts: {},
}

export default function Config(config?: MTYKFrontendConfig) {
  if (config) {
    Object.assign(_config, config)
    if ('fonts' in _config) {
      _config.fontMap = fromPairs(
        _(config.fonts)
          .toPairs()
          .reduce((prev, [k, v]) => {
            const match = k.match(/[0-9]{3,4}/)
            if (match) {
              return [...prev, [parseInt(match[0], 10), k]]
            }
            return prev
          }, [])
      )
    }
  }
  console.log(
    `MTYK config applied with config: ${JSON.stringify(_config, null, 2)}`
  )
  return _config
}

export const config = _config
