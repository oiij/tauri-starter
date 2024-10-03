import { Store } from '@tauri-apps/plugin-store'

export function useTauriStore(path: string) {
  const store = new Store(0, path)
  return store
}
