import ignore from "ignore";

interface TreeItem {
  title: string;
  children?: TreeItem[];
  handle?: FileSystemHandle;
  type: "file" | "directory";
  id: string;
}

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

export default function useFile() {
  const ig = ignore();

  function transformNode(item: TreeItem): any {
    return {
      title: item.title,
      icon:
        item.type === "directory" ? "lucide:folder" : getFileIcon(item.title),
      children: item.children?.map((child) => transformNode(child)),
    };
  }

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
          const subFiles = await getFilesRecursively(
            entry as FileSystemDirectoryHandle,
            entryPath
          );
          fileHandles.push(...subFiles);
        }
      }
    }

    return fileHandles;
  }

  async function setupGitignore(dirHandle: FileSystemDirectoryHandle) {
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
  }

  async function getFileContent(
    projectPath: FileSystemDirectoryHandle,
    path: string
  ): Promise<string> {
    const parts = path.split("/").filter(Boolean);
    const fileName = parts.pop();
    let currentHandle = projectPath;

    for (const part of parts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    const fileHandle = await currentHandle.getFileHandle(fileName!);
    const file = await fileHandle.getFile();
    return await file.text();
  }

  async function createFile(
    projectPath: FileSystemDirectoryHandle,
    path: string,
    content: string
  ) {
    const parts = path.split("/");
    const fileName = parts.pop();
    let currentDirHandle = projectPath;

    for (const part of parts) {
      currentDirHandle = await currentDirHandle.getDirectoryHandle(part, {
        create: true,
      });
    }

    const fileHandle = await currentDirHandle.getFileHandle(fileName!, {
      create: true,
    });

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
  }

  return {
    getFileIcon,
    transformNode,
    convertToArray,
    getFilesRecursively,
    setupGitignore,
    getFileContent,
    createFile,
  };
}
