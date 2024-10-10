import { listen } from '@tauri-apps/api/event'
import { getAllWindows, getCurrentWindow } from '@tauri-apps/api/window'
import { locale as systemLocal } from '@tauri-apps/plugin-os'
import { defineStore } from 'pinia'
import { router } from '~/modules'

export const useAppStore = defineStore(
  'appStore',
  () => {
    const isTauri = ref(window.isTauri)
    const { locale, setLocale, toggle } = useLocale()
    const { value: collapsed, toggle: toggleCollapsed } = useBoolean(false)
    const language = ref(locale.value)
    async function getLocale() {
      const store = await useTauriStore()
      const lang = await store.get<string>('locale')
      if (lang) {
        if (lang === 'system') {
          const _locale = await systemLocal()
          if (_locale) {
            setLocale(_locale)
          }
        }
        else {
          setLocale(lang)
        }
        language.value = lang
      }
    }
    async function setLanguage(lang: string) {
      if (isTauri.value) {
        const store = await useTauriStore()
        await store.set('locale', lang)
      }
      if (lang === 'system') {
        if (isTauri.value) {
          const _locale = await systemLocal()
          if (_locale) {
            setLocale(_locale)
          }
        }
        else {
          const _locale = navigator.language
          if (_locale) {
            setLocale(_locale)
          }
        }
      }
      else {
        setLocale(lang)
      }
      language.value = lang
    }
    const theme = ref('light')
    async function getThemeMode() {
      const store = await useTauriStore()
      const _theme = await store.get<string>('theme')
      if (_theme) {
        if (_theme === 'system') {
          const _theme = await getCurrentWindow().theme()
          isDark.value = _theme === 'dark'
        }
        else {
          isDark.value = _theme === 'dark'
        }
        theme.value = _theme
      }
      else {
        isDark.value = theme.value === 'dark'
      }
    }
    async function setThemeMode(mode: string) {
      if (isTauri.value) {
        const store = await useTauriStore()
        await store.set('theme', mode)
      }
      if (mode === 'system') {
        if (isTauri.value) {
          const _theme = await getCurrentWindow().theme()
          isDark.value = _theme === 'dark'
        }
        else {
          const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          isDark.value = isDarkMode
        }
      }
      else {
        isDark.value = mode === 'dark'
      }
      theme.value = mode
    }
    async function initTauriEventListen() {
      const window = (await getAllWindows()).find(f => f.label === 'main')
      window?.setShadow(true)
      window?.show()
      await listen('open-setting', () => {
        router.push('/setting')
      })
    }
    async function init() {
      if (isTauri.value) {
        await getLocale()
        await getThemeMode()
        await initTauriEventListen()
      }
    }
    init()
    return {
      isTauri,
      locale,
      toggle,
      language,
      setLanguage,
      theme,
      setThemeMode,
      collapsed,
      toggleCollapsed,
    }
  },
  {
    persist: {
      key: '__APP_STORE_PERSIST__',
      pick: [''],
    },
  },
)
