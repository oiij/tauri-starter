import { ask, confirm, message, open, save } from '@tauri-apps/plugin-dialog'

export function useTauriDialog() {
  return {
    ask,
    confirm,
    message,
    open,
    save,
  }
}
