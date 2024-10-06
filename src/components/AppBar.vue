<script setup lang='ts'>
import { getCurrentWindow } from '@tauri-apps/api/window'

const { title, showMaximizeButton = true } = defineProps<{
  title?: string | null
  showMaximizeButton?: boolean
}>()
const isFullscreen = ref(false)
const window = getCurrentWindow()
async function onMinimize() {
  await window.minimize()
}
async function toggleFullScreen() {
  const isMaximized = await window.isMaximized()
  isFullscreen.value = !isMaximized
  await window.toggleMaximize()
}
async function onClose() {
  await window.hide()
}
onMounted(() => {
  window.isMaximized().then((res) => {
    isFullscreen.value = res
  })
})
</script>

<template>
  <div class="h-[28px] w-full flex">
    <div class="flex-y-center flex-1" data-tauri-drag-region>
      <slot name="title">
        <div v-if="title" class="pointer-events-none select-none p-x-3">
          {{ title }}
        </div>
      </slot>
    </div>
    <div class="flex-y-center">
      <slot name="actions">
        <n-button quaternary size="small" type="default" class="rounded-0!" @click="onMinimize">
          <template #icon>
            <i class="i-mage-minus" />
          </template>
        </n-button>
        <n-button v-if="showMaximizeButton" quaternary size="small" type="default" class="rounded-0!" @click="toggleFullScreen">
          <template #icon>
            <i :class="isFullscreen ? 'i-mage-scale-down' : 'i-mage-scale-up'" />
          </template>
        </n-button>
        <n-button quaternary size="small" type="error" class="rounded-0!" @click="onClose">
          <template #icon>
            <i class="i-mage-multiply" />
          </template>
        </n-button>
      </slot>
    </div>
  </div>
</template>

<style scoped lang='less'>

</style>
