export interface SettingTemplate {
  key: string
  value: any
  type: 'boolean' | 'shortcut' | 'string' | 'mod'
  mod?: string
}
