import { useNaiveTheme } from '@oiij/naive-ui'
import { useBoolean } from '@oiij/use'
import { listen } from '@tauri-apps/api/event'
import { defineStore } from 'pinia'
import { router, useLanguage } from '~/modules'

export const useAppStore = defineStore(
  'appStore',
  () => {
    const isTauri = ref(window.isTauri)
    const { locale, language } = useLanguage()
    const { isDark, preferredDark, colorMode } = useTheme()
    const { color, theme, themeOverrides, locale: naiveLocal, dateLocale } = useNaiveTheme(isDark, locale)
    const { value: collapsed, toggle: toggleCollapsed } = useBoolean(false)

    async function initTauriEventListen() {
      await listen('open-setting', () => {
        router.push('/setting')
      })
    }
    async function init() {
      if (isTauri.value) {
        await initTauriEventListen()
      }
    }
    init()
    return {
      isTauri,
      locale,
      language,
      isDark,
      preferredDark,
      colorMode,
      color,
      theme,
      themeOverrides,
      naiveLocal,
      dateLocale,
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
