import { listen } from '@tauri-apps/api/event'
import { getAllWindows } from '@tauri-apps/api/window'
import { defineStore } from 'pinia'
import { router } from '~/modules'

export const useAppStore = defineStore(
  'appStore',
  () => {
    const isTauri = ref(window.isTauri)
    const { language, setLanguage } = useLanguage()
    const { colorMode } = useTheme()
    const { value: collapsed, toggle: toggleCollapsed } = useBoolean(false)
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
        await initTauriEventListen()
      }
    }
    init()
    return {
      isTauri,
      language,
      setLanguage,
      colorMode,
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
