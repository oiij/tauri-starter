import { isFunction } from '@oiij/utils/is'

export function defineTauri(fn?: () => void) {
  if (window.isTauri) {
    isFunction(fn) && fn()
  }
}
