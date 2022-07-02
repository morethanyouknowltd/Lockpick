import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { ModAction } from '../../../connector/shared/state/models/Mod.model'
import { sendPromise } from '../../bitwig-api/Bitwig'
import { Select } from '../../core/Select'
import { shortcutToTextDescription, shouldShortcutWarn } from '../helpers/settingTitle'
import { charMapMac, ignoreSet } from './ignoreSet'
import { InputWrap, ShortcutInput, ShortcutWrap, WarningText } from './ShortcutInput'

export const SettingAction = ({ action }: { action: ModAction }) => {
  const { setting } = action
  const [value, setValue] = useState(action.setting.value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setValue(setting.value)
  }, [setting.id])

  const updateValue = (value: any) => {
    sendPromise({
      type: 'api/settings/set',
      data: {
        ...action,
        value,
      },
    })
    setValue(value)
  }

  const onSpecialChange = (special: any) => {
    updateValue({
      ...value,
      special: special.target.value,
    })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    // debugger
    event.preventDefault()
    let key = charMapMac[event.keyCode] || event.key
    const nativecode = event.nativeEvent.code
    if (nativecode.indexOf('Numpad') == 0) {
      key = nativecode
    }
    const overrides = {
      '±': '§',
      Unidentified: '§',
      Dead: '`',
      '~': '`',
      Ÿ: '`',
    }
    if (event.key in overrides) {
      key = overrides[event.key]
    }

    if (ignoreSet.has(key)) {
      return
    } else {
      let keys = [key]
      if (event.metaKey) {
        keys.push('Meta')
      }
      if (event.shiftKey) {
        keys.push('Shift')
      }
      if (event.ctrlKey) {
        keys.push('Control')
      }
      if (event.altKey) {
        keys.push('Alt')
      }
      const shortcut = keys.reverse()
      updateValue({ ...value, keys: shortcut })
    }
  }

  const onBlur = () => {
    setFocused(false)
  }

  const onFocus = () => {
    setFocused(true)
  }

  const getValue = () => {
    if (value.keys?.length === 0 ?? true) {
      return focused ? 'Listening...' : 'Click to set shortcut...'
    } else {
      return shortcutToTextDescription({ value })
    }
  }

  const props = {
    onBlur,
    onFocus,
    onKeyDown,
    value: getValue(),
    readOnly: true,
  }
  const wrapProps = {
    focused,
    noShortcut: (value.keys || []).length === 0,
  }

  const optionProps = (key: string, label: string) => {
    return {
      label,
      value: Boolean(value[key]),
      onChange: (newVal: any) => updateValue({ ...value, [key]: newVal }),
      key,
      id: action.id + key,
    }
  }

  const options = [
    // ...(action.setting.type !== 'shortcut' ? [optionProps('showInMenu', 'Show in Menu')] : []),
    optionProps('doubleTap', 'Double-tap'),
  ]

  const opts = [
    { key: 'mouse-button-0', label: 'Left Click' },
    { key: 'mouse-button-1', label: 'Middle Click' },
    { key: 'mouse-button-2', label: 'Right Click' },
    { key: 'mouse-button-3', label: 'Mouse Button 4' },
    { key: 'mouse-button-4', label: 'Mouse Button 5' },
  ]

  return (
    <ShortcutWrap>
      <InputWrap {...wrapProps}>
        <ShortcutInput id={`SettingShortcut${action.id}`} {...props} />
        <div className="setdefault">
          <FontAwesomeIcon
            onClick={() => updateValue({ ...value, keys: [] })}
            icon={faTimesCircle}
          />
        </div>
      </InputWrap>
      <Select
        style={{ width: '100%', marginTop: '.4em' }}
        onChange={onSpecialChange}
        value={value?.special ?? 'null'}>
        <option value="null">Add extra trigger...</option>
        <hr />
        {opts.map(size => {
          return (
            <option key={size.key} value={size.key}>
              {size.label}
            </option>
          )
        })}
      </Select>
      {shouldShortcutWarn(action.setting) ? (
        <WarningText>
          Please note it's currently not possible to prevent single character shortcuts from
          triggering in text fields
        </WarningText>
      ) : null}
      {/* <OptionsWrap>
            {options.map(option => {
                return <Option {...option} />
            })}
        </OptionsWrap> */}
    </ShortcutWrap>
  )
}
