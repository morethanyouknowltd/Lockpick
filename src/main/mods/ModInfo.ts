import winston = require('winston')

export interface ModInfo {
  name: string
  logger: winston.Logger
  version: string
  settingsKey: string
  disabled: boolean
  description: string
  category: string
  id: string
  actions: { [actionKey: string]: any }
  path: string
  noReload: boolean
  valid: boolean
  error?: any
}
export interface CueMarker {
  name: string
  position: number
  color: string
}
export interface Device {
  name: string
}
export interface SettingInfo {
  name: string
  description?: string
  hidden: boolean
}
