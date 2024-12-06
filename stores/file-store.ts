import { defineStore } from "pinia";
import { ref, computed } from "vue";
import yaml from "yaml";
import useFile from "@/composables/useFile";

export interface SchemaModel {
  type: string;
  mappings: Record<
    string,
    {
      type: string;
      map?: string;
      required?: boolean;
    }
  >;
  relationships?: Record<
    string,
    {
      type: string;
      map: string;
    }
  >;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

export const useFileStore = defineStore("file", () => {
  const files = ref<FileSystemHandle[]>([]);
  const projectPath = ref<FileSystemDirectoryHandle | null>(null);
  const modelSchema = ref<Record<string, SchemaModel> | null>(null);
  const formSchema = ref<string>("");
  const {
    transformNode,
    convertToArray,
    getFilesRecursively,
    setupGitignore,
    getFileContent,
    createFile,
  } = useFile();

  const fileTree = computed(() => {
    const tree: Record<string, any> = {};

    files.value.forEach((file) => {
      const path = (file as any).path;
      if (!path) {
        console.warn("Skipping file with no path:", file);
        return;
      }

      const parts = path.split("/").filter(Boolean);
      if (parts.length === 0) {
        console.warn("Skipping file with empty path parts:", file);
        return;
      }

      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join("/");

        if (!current[part]) {
          current[part] = {
            id: currentPath,
            title: part,
            children: {},
            handle: isLast ? file : undefined,
            type: isLast
              ? file.kind === "directory"
                ? "directory"
                : "file"
              : "directory",
          };
        }

        current = current[part].children;
      }
    });

    return convertToArray(tree);
  });

  const treeItems = computed(() => {
    return fileTree.value.map((item) => transformNode(item));
  });

  async function openFolder() {
    try {
      const dirHandle = await window.showDirectoryPicker();
      projectPath.value = dirHandle;

      await setupGitignore(dirHandle);
      files.value = await getFilesRecursively(dirHandle);

      await parseSchemaModels(
        await getFileContent(dirHandle, "/mappers/schema.tw")
      );
      formSchema.value = await getFileContent(dirHandle, "/mappers/form.tw");
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  }

  async function handleCreateFile(path: string, content: string) {
    try {
      await createFile(projectPath.value!, path, content);
      files.value = await getFilesRecursively(projectPath.value!);
    } catch (error) {
      console.error("Error creating file:", error);
    }
  }

  async function parseSchemaModels(schema: string) {
    const parsed = yaml.parse(schema);
    const models: Record<string, any> = {};

    for (const [modelName, modelData] of Object.entries(parsed)) {
      const data = modelData as SchemaModel;
      if (data.type !== "model") continue;

      models[modelName] = {
        type: data.type,
        mappings: data.mappings || {},
        relationships: data.relationships || {},
      };
    }

    modelSchema.value = models as Record<string, SchemaModel>;
  }

  return {
    files,
    fileTree,
    treeItems,
    openFolder,
    createFile: handleCreateFile,
    projectPath,
    getFileContent: (path: string) => getFileContent(projectPath.value!, path),
    modelSchema,
    formSchema,
  };
});
