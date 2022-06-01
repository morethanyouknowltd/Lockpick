import { config } from '../helpers/config'

export default function isDev() {
  return config.environment === 'development'
}
