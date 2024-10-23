import { Store } from '@tauri-apps/plugin-store'

export async function useTauriStore(path: string = 'store.bin') {
  const store = await Store.load(path, {
    // we can save automatically after each store modification
    autoSave: 100,
  })
  return store
}
