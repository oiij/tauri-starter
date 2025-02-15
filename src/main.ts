import { getAllWindows } from '@tauri-apps/api/window'
import { createApp } from 'vue'
import { useModules } from '~/modules'
import App from './App.vue'
import { defineTauri } from './utils'
import '~/assets'

const app = createApp(App)
useModules(app)
app.mount('#app').$nextTick(() => {
  defineTauri(async () => {
    const allWindow = await getAllWindows()
    await allWindow.find(f => f.label === 'loading')?.hide()
    await allWindow.find(f => f.label === 'main')?.show()
  })
})
