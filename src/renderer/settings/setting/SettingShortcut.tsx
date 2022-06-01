import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { sendPromise } from '../../bitwig-api/Bitwig'
import { shortcutToTextDescription, shouldShortcutWarn } from '../helpers/settingTitle'
import { Checkbox } from '../../core/Checkbox'
import { state } from '../../core/State'
import { Select } from '../../core/Select'

const ShortcutInput = styled.input`
  padding: 1rem 0.5rem;
  background: transparent;
  &,
  &:focus {
    border: none;
    outline: none;
  }
  text-align: center;
  cursor: pointer;
`
const ShortcutWrap = styled.div`
  user-select: none;
  cursor: default;
`
const InputWrap = styled.div`
  border: 1px solid ${(props: any) => (props.focused ? `#CCC` : `#272727`)};
  background: ${(props: any) => (props.noShortcut ? `transparent` : `#272727`)};
  border-radius: 0.3rem;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  input {
    color: #a6a6a6;
  }
  font-size: ${(props: any) => (props.noShortcut ? `.8em` : `1em`)};
  div {
    opacity: 0;
    position: absolute;
    top: 50%;
    right: 0.8em;
    transform: translateY(-50%);
    font-size: 0.8em;
  }
  &:hover {
    div {
      transition: opacity 0.3s;
      opacity: ${(props: any) => (props.noShortcut ? `0` : `1`)};
    }
  }
`
const OptionsWrap = styled.div`
  align-items: center;
  color: #666;
  display: table;
  margin: 0 auto;
  margin-top: 0.5rem;
`
const OptionWrap = styled.div`
  display: flex;
  cursor: pointer !important;
  &:hover {
    color: #aaa;
  }
  align-items: center;
  &:not(:last-child) {
    margin-bottom: 0.1rem;
  }
  font-size: 0.7em;
`
const ignoreSet = new Set(['Meta', 'Shift', 'Control', 'Alt', 'CapsLock'])
const charMap = {
  '31': '',
  '32': ' ',
  '33': '!',
  '34': '"',
  '35': '#',
  '36': '$',
  '37': '%',
  '38': '&',
  '39': "'",
  '40': '(',
  '41': ')',
  '42': '*',
  '43': '+',
  '44': ',',
  '45': '-',
  '46': '.',
  '47': '/',
  '48': '0',
  '49': '1',
  '50': '2',
  '51': '3',
  '52': '4',
  '53': '5',
  '54': '6',
  '55': '7',
  '56': '8',
  '57': '9',
  '58': ':',
  '59': ';',
  '60': '<',
  '61': '=',
  '62': '>',
  '63': '?',
  '64': '@',
  '65': 'A',
  '66': 'B',
  '67': 'C',
  '68': 'D',
  '69': 'E',
  '70': 'F',
  '71': 'G',
  '72': 'H',
  '73': 'I',
  '74': 'J',
  '75': 'K',
  '76': 'L',
  '77': 'M',
  '78': 'N',
  '79': 'O',
  '80': 'P',
  '81': 'Q',
  '82': 'R',
  '83': 'S',
  '84': 'T',
  '85': 'U',
  '86': 'V',
  '87': 'W',
  '88': 'X',
  '89': 'Y',
  '90': 'Z',
  '91': '[',
  '92': '\\',
  '93': ']',
  '94': '^',
  '95': '_',
  '96': '`',
  '97': 'a',
  '98': 'b',
  '99': 'c',
  '100': 'd',
  '101': 'e',
  '102': 'f',
  '103': 'g',
  '104': 'h',
  '105': 'i',
  '106': 'j',
  '107': 'k',
  '108': 'l',
  '109': 'm',
  '110': 'n',
  '111': 'o',
  '112': 'p',
  '113': 'q',
  '114': 'r',
  '115': 's',
  '116': 't',
  '117': 'u',
  '118': 'v',
  '119': 'w',
  '120': 'x',
  '121': 'y',
  '122': 'z',
  '123': '{',
  '124': '|',
  '125': '}',
  '126': '~',
  '127': '',
}
const charMapMac = {
  13: 'Enter',
  16: 'Shift',
  17: 'Control',
  18: 'Alt',
  20: 'CapsLock',
  9: 'Tab',
  27: 'Escape',
  31: '',
  32: 'Space',
  33: '!',
  34: '"',
  35: '#',
  36: '$',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  41: ')',
  42: '*',
  43: '+',
  44: ',',
  45: '-',
  46: '.',
  47: '/',
  48: '0',
  49: '1',
  50: '2',
  51: '3',
  52: '4',
  53: '5',
  54: '6',
  55: '7',
  56: '8',
  57: '9',
  58: ':',
  59: ';',
  60: '<',
  61: '=',
  62: '>',
  63: '?',
  64: '@',
  65: 'A',
  66: 'B',
  67: 'C',
  68: 'D',
  69: 'E',
  70: 'F',
  71: 'G',
  72: 'H',
  73: 'I',
  74: 'J',
  75: 'K',
  76: 'L',
  77: 'M',
  78: 'N',
  79: 'O',
  80: 'P',
  81: 'Q',
  82: 'R',
  83: 'S',
  84: 'T',
  85: 'U',
  86: 'V',
  87: 'W',
  88: 'X',
  89: 'Y',
  90: 'Z',
  91: 'Meta',
  92: '\\',
  93: ']',
  94: '^',
  95: '_',
  96: '`',
  97: 'a',
  98: 'b',
  99: 'c',
  100: 'd',
  101: 'e',
  102: 'f',
  103: 'g',
  104: 'h',
  105: 'i',
  106: 'j',
  107: 'k',
  108: 'l',
  109: 'm',
  110: 'n',
  111: 'o',
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  124: '|',
  125: '}',
  126: '~',
  127: '',
  189: '-',
  186: ';',
  187: '=',
  192: '`',
  219: '[',
  220: '\\',
  221: ']',
  222: "'",
}

const Option = ({ value, id, onChange, label }) => {
  return (
    <OptionWrap>
      <Checkbox
        id={id}
        name={label}
        style={{ marginRight: '.5em' }}
        checked={value}
        onChange={event => {
          onChange(event.target.checked)
        }}
      />
      <label htmlFor={id}>{label}</label>
    </OptionWrap>
  )
}

const WarningText = styled.div`
  font-size: 0.7em;
  margin: 1em 0;
  color: #8c8c8c;
`

export const SettingShortcut = ({ setting }) => {
  const [value, setValue] = useState(setting.value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setValue(setting.value)
  }, [setting.key])

  const updateValue = value => {
    sendPromise({
      type: 'api/settings/set',
      data: {
        ...setting,
        value,
      },
    })
    setValue(value)
    if (setting.mod) {
      state.reloadMod(setting.mod)
    }
  }

  const onSpecialChange = special => {
    updateValue({
      ...value,
      special: special.target.value,
    })
  }

  const onKeyDown = event => {
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

  const optionProps = (key, label) => {
    return {
      label,
      value: Boolean(value[key]),
      onChange: newVal => updateValue({ ...value, [key]: newVal }),
      key,
      id: setting.key + key,
    }
  }

  const options = [
    ...(setting.type !== 'shortcut' ? [optionProps('showInMenu', 'Show in Menu')] : []),
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
        <ShortcutInput id={`SettingShortcut${setting.id}`} {...props} />
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
      {shouldShortcutWarn(setting) ? (
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
