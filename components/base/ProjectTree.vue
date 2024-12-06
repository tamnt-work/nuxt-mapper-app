<template>
  <TreeRoot
    v-if="fileStore.files.length"
    v-slot="{ flattenItems }"
    class="list-none select-none w-56 bg-white text-blackA11 rounded-lg p-2 text-sm font-medium"
    :items="fileStore.treeItems"
    :get-key="(item) => item.title"
  >
    <h2 class="font-semibold !text-base text-blackA11 px-2 pt-1">
      Project Files
    </h2>
    <TreeItem
      v-for="item in flattenItems"
      v-slot="{ isExpanded }"
      :key="item._id"
      :style="{ 'padding-left': `${item.level - 0.5}rem` }"
      v-bind="item.bind"
      class="flex items-center py-1 px-2 my-0.5 rounded outline-none focus:ring-grass8 focus:ring-2 data-[selected]:bg-grass4"
    >
      <template v-if="item.hasChildren">
        <Icon v-if="!isExpanded" icon="lucide:folder" class="h-4 w-4" />
        <Icon v-else icon="lucide:folder-open" class="h-4 w-4" />
      </template>
      <Icon v-else :icon="item.value.icon" class="h-4 w-4" />
      <div class="pl-2">
        {{ item.value.title }}
      </div>
    </TreeItem>
  </TreeRoot>
</template>

<script setup lang="ts">
const fileStore = useFileStore();
import { TreeItem, TreeRoot } from "radix-vue";
import { Icon } from "@iconify/vue";
</script>
