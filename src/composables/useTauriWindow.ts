import type { WebviewOptions } from '@tauri-apps/api/webview'
import type { WindowOptions } from '@tauri-apps/api/window'
import { Webview } from '@tauri-apps/api/webview'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { Window } from '@tauri-apps/api/window'
import { nanoid } from 'nanoid'

export function useCreateWindow(label = nanoid(), options?: WindowOptions) {
  return new Promise<{ window: Window }>((resolve, reject) => {
    const window = new Window(label, {
      width: 600,
      height: 400,
      resizable: true,
      fullscreen: false,
      decorations: false,
      transparent: true,
      titleBarStyle: 'visible',
      hiddenTitle: false,
      focus: true,
      ...options,
    })
    window.once('tauri://error', e => reject(e))
    window.once('tauri://created', () => resolve({ window }))
  })
}
export function useCreateWebView(window: Window, label = nanoid(), url?: string, options?: WebviewOptions) {
  return new Promise<{ webview: Webview }>((resolve, reject) => {
    const webview = new Webview(window, label, {
      url,
      x: 0,
      y: 0,
      width: 600,
      height: 400,
      ...options,
    })
    webview.once('tauri://error', e => reject(e))
    webview.once('tauri://created', () => resolve({ webview }))
  })
}
export function useCreateWebViewWindow(label = nanoid(), options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> & WindowOptions) {
  return new Promise<{ webviewWindow: WebviewWindow }>((resolve, reject) => {
    const webviewWindow = new WebviewWindow(label, {
      resizable: true,
      fullscreen: false,
      decorations: false,
      transparent: true,
      titleBarStyle: 'visible',
      hiddenTitle: false,
      focus: true,
      width: 600,
      height: 400,
      ...options,
    })
    webviewWindow.once('tauri://error', e => reject(e))
    webviewWindow.once('tauri://created', () => resolve({ webviewWindow }))
  })
}
