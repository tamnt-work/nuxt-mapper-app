<template>
  <div class="h-screen max-h-screen flex flex-col">
    <div class="pt-2 px-2">
      <BaseMenuBar />
    </div>

    <div
      v-if="fileStore.projectPath"
      class="px-4 py-2 text-sm text-muted-foreground border-b"
    >
      Project: {{ fileStore.projectPath.name }}
    </div>

    <div class="flex-1 flex">
      <div
        class="border-r border-border max-h-[calc(100vh-81px)] overflow-y-auto"
      >
        <BaseProjectTree />
      </div>
      <div class="flex-1">
        <div class="min-h-full max-h-[calc(100vh-81px)] overflow-y-auto p-4">
          <slot />
        </div>
      </div>
    </div>

    <Toaster />
  </div>
</template>

<script setup lang="ts">
const fileStore = useFileStore();
</script>
