import { defineStore } from "pinia";
import { ref, computed } from "vue";
import ignore from "ignore";

interface TreeItem {
  title: string;
  children?: TreeItem[];
  handle?: FileSystemHandle;
  type: "file" | "directory";
  id: string;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

export const useFileStore = defineStore("file", () => {
  const files = ref<FileSystemHandle[]>([]);
  const projectPath = ref<any>(null);
  const ig = ignore();

  // Helper function to get file icon based on extension
  function getFileIcon(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "vue":
        return "vscode-icons:file-type-vue";
      case "ts":
      case "tsx":
        return "vscode-icons:file-type-typescript";
      case "js":
      case "jsx":
        return "vscode-icons:file-type-js";
      case "json":
        return "vscode-icons:file-type-json";
      case "md":
        return "vscode-icons:file-type-markdown";
      case "svg":
        return "vscode-icons:file-type-svg";
      case "yaml":
      case "yml":
        return "vscode-icons:file-type-yaml";
      case "mjs":
        return "vscode-icons:file-type-js";
      default:
        return "lucide:file";
    }
  }

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

    function convertToArray(obj: Record<string, any>): TreeItem[] {
      return Object.entries(obj)
        .filter(([key]) => key)
        .map(([_, item]) => ({
          ...item,
          children:
            item.children && Object.keys(item.children).length > 0
              ? convertToArray(item.children)
              : undefined,
        }))
        .sort((a, b) => {
          if (a.type === "directory" && b.type === "file") return -1;
          if (a.type === "file" && b.type === "directory") return 1;
          return a.title.localeCompare(b.title);
        });
    }

    return convertToArray(tree);
  });

  const treeItems = computed(() => {
    function transformNode(item: TreeItem): any {
      return {
        title: item.title,
        icon:
          item.type === "directory" ? "lucide:folder" : getFileIcon(item.title),
        children: item.children?.map((child) => transformNode(child)),
      };
    }

    return fileTree.value.map((item) => transformNode(item));
  });

  async function getFilesRecursively(
    dirHandle: FileSystemDirectoryHandle,
    path = ""
  ) {
    const fileHandles: FileSystemHandle[] = [];

    for await (const entry of (dirHandle as any).values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      if (ig.ignores(entryPath)) {
        console.log(`Ignoring ${entryPath} due to .gitignore rules`);
        continue;
      }

      (entry as any).path = entryPath;
      fileHandles.push(entry);

      if (entry.kind === "directory") {
        if (!ig.ignores(`${entryPath}/`)) {
          // Get files from subdirectory
          const subFiles = await getFilesRecursively(
            entry as FileSystemDirectoryHandle,
            entryPath
          );
          // Add subdirectory files to our collection
          fileHandles.push(...subFiles);
        }
      }
    }

    // Only update files.value at the top level
    if (!path) {
      files.value = fileHandles;
    }

    return fileHandles;
  }

  async function openFolder() {
    try {
      const dirHandle = await window.showDirectoryPicker();

      projectPath.value = dirHandle;

      // Read .gitignore first
      try {
        const gitignoreHandle = await dirHandle.getFileHandle(".gitignore");
        const file = await gitignoreHandle.getFile();
        const content = await file.text();

        ig.add([
          "node_modules",
          ".git",
          ".DS_Store",
          ...content
            .split("\n")
            .filter((line) => line.trim() && !line.startsWith("#")),
        ]);
      } catch (e) {
        console.log("No .gitignore file found, using default ignores");
        ig.add(["node_modules", ".git", ".DS_Store"]);
      }

      await getFilesRecursively(dirHandle);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  }

  async function createFile(path: string, content: string) {
    try {
      const parts = path.split("/");
      const fileName = parts.pop();

      // Traverse through the path to get to the correct directory
      let currentDirHandle = null;
      for (const part of parts) {
        currentDirHandle = await projectPath.value.getDirectoryHandle(part, {
          create: true,
        });
      }

      // Create the file in the final directory
      const fileHandle = await currentDirHandle.getFileHandle(fileName!, {
        create: true,
      });

      // Write content to the file
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      console.log(`File created at ${path}`);

      // Reload the file tree
      await getFilesRecursively(projectPath.value);
    } catch (error) {
      console.error("Error creating file:", error);
    }
  }

  return {
    files,
    fileTree,
    treeItems,
    openFolder,
    createFile,
    projectPath,
  };
});
