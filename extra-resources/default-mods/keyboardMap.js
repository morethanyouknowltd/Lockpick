/// <reference path="../lockpick-mod-api.d.ts" />
/**
 * @name Keyboard Map
 * @id keyboard-map
 * @description Simple 1:1 keyboard map to remap common keys.
 * @category global
 * @creator More Than You Know
 */

const keys = [
  'headerCharacters',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'headerNumbers',
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'headerNumpad Numbers',
  'Numpad0',
  'Numpad1',
  'Numpad2',
  'Numpad3',
  'Numpad4',
  'Numpad5',
  'Numpad6',
  'Numpad7',
  'Numpad8',
  'Numpad9',
  'headerArrow Keys',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'headerOther',
  'Enter',
  'Escape',
]

let currentCategory = null
for (const char of keys) {
  if (char.indexOf('header') === 0) {
    currentCategory = Mod.registerActionCategory({
      title: char.substr(6),
    })
    continue
  }
  Mod.registerAction({
    title: `${char}`,
    id: `${char}`,
    description: `Map another shortcut to the '${char}' key`,
    category: currentCategory,
    action: async () => {
      Keyboard.keyPress(char, { lockpickListeners: true })
    },
  })
  Mod.registerAction({
    title: `Shift + ${char}`,
    id: `shift-${char}`,
    description: `Map another shortcut to the 'Shift' + '${char}' keys`,
    category: currentCategory,
    action: async () => {
      Keyboard.keyPress(char, {
        Shift: true,
        lockpickListeners: true,
      })
    },
  })
}
