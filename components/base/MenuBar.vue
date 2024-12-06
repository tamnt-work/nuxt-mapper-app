<template>
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @select="fileStore.openFolder">Open Folder</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu v-if="fileStore.projectPath">
      <MenubarTrigger>Mappers</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @select="onCreateSchemaMapper"
          >Create Schema Mapper</MenubarItem
        >
        <MenubarSeparator />
        <MenubarItem @select="onGenerateModelAndDTO"
          >Generate All Mappers</MenubarItem
        >
        <MenubarSeparator />
        <MenubarItem>View Visualizer Schema</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu v-if="fileStore.projectPath">
      <MenubarTrigger>Forms</MenubarTrigger>
      <MenubarContent>
        <MenubarItem @select="onCreateSchemaForm"
          >Create Schema Form</MenubarItem
        >
        <MenubarSeparator />
        <MenubarItem>Generate Forms</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu v-if="fileStore.projectPath">
      <MenubarTrigger>Services</MenubarTrigger>
      <MenubarContent>
        <MenubarItem>Create Service</MenubarItem>
      </MenubarContent>
    </MenubarMenu>
    <MenubarMenu>
      <MenubarTrigger>Settings</MenubarTrigger>
    </MenubarMenu>
  </Menubar>
</template>

<script setup lang="ts">
import { toast } from "vue-sonner";

const fileStore = useFileStore();
const { generateModelAndDTO } = useMapper();

async function onCreateSchemaMapper() {
  const schemaContent = `# =============================================================================
# Schema Definition File
# =============================================================================
#
# This file defines the data models and their relationships for the application.
# Each model specifies its properties, types, mappings, and relationships with
# other models.
#
# Structure:
# - Each model is defined with its properties and relationships
# - 'type: model' indicates a model definition
# - 'mappings' define the model's properties and their types
# - 'relationships' define connections between models
#
# =============================================================================`;

  const path = "mappers/schema.tw";
  await fileStore.createFile(path, schemaContent);
  toast(`File created to ${path}`);
}

async function onCreateSchemaForm() {
  const path = "mappers/form.tw";
  await fileStore.createFile(path, "");
  toast(`File created to ${path}`);
}

const onGenerateModelAndDTO = () => {
  generateModelAndDTO();
};
</script>
