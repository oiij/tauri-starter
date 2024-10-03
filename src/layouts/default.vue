<script setup lang="ts">
const title = useTitle()
</script>

<template>
  <div class="wh-full flex-col">
    <header class="w-full">
      <AppBar :title="title" />
    </header>
    <main class="min-h-0 flex-col flex-1 overflow-hidden">
      <RouterEntry />
    </main>
  </div>
</template>

<style scoped lang="less"></style>
