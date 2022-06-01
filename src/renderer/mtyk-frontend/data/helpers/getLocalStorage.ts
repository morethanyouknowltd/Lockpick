import AsyncStorage from '@react-native-async-storage/async-storage'
import { config } from '../../core/helpers/config'
import coerceAsync from '../../timing/helpers/coerceAsync'

const { isNative } = config

const localStorage = isNative
  ? {
    getItem: (item: string) => AsyncStorage.getItem(item),
    setItem: (item: string, value: string) =>
      AsyncStorage.setItem(item, value),
    removeItem: (item: string) => AsyncStorage.removeItem(item),
  }
  : {
    getItem: (item: string) => coerceAsync(window.localStorage.getItem(item)),
    setItem: (item: string, value: string) =>
      coerceAsync(window.localStorage.setItem(item, value)),
    removeItem: (item: string) =>
      coerceAsync(window.localStorage.removeItem(item)),
  }

export default localStorage
