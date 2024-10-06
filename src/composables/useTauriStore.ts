import { createStore } from '@tauri-apps/plugin-store'

export async function useTauriStore(path: string = 'store.bin') {
  const store = await createStore(path, {
    // we can save automatically after each store modification

  })
  return store
}
