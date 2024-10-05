import { getCurrentWindow } from '@tauri-apps/api/window'
import { createApp } from 'vue'
import { useModules } from '~/modules'
import App from './App.vue'
import '~/assets'

const window = getCurrentWindow()
const app = createApp(App)
useModules(app)
app.mount('#app').$nextTick(() => {
  window.setShadow(true)
  window.show()
  // window.postMessage({ client: 'mounted' }, '*')
})
