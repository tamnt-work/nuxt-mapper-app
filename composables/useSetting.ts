export function useSetting() {
  async function initSchemaFormat() {
    const { projectPath, createFile, getFileContent } = useFileStore();

    if (!projectPath) {
      console.warn("No project path found");
      return;
    }

    const newSettings = {
      "files.associations": {
        "*.tw": "yaml",
      },
      "editor.tokenColorCustomizations": {
        textMateRules: [
          {
            scope: "string.unquoted.plain.out.yaml",
            settings: {
              foreground: "#da8f33",
            },
          },
          {
            scope: ["entity.name.tag.yaml"],
            settings: {
              foreground: "#71eb94",
            },
          },
        ],
      },
    };

    try {
      // Try to read existing settings
      let existingSettings: Record<string, any> = {};
      try {
        const content = await getFileContent(".vscode/settings.json");
        existingSettings = JSON.parse(content);
      } catch (error) {
        // File doesn't exist or is invalid JSON, use empty object
        console.info("No existing settings found, creating new file");
      }

      // Merge settings
      const mergedSettings = {
        ...existingSettings,
        "files.associations": {
          ...existingSettings["files.associations"],
          ...newSettings["files.associations"],
        },
        "editor.tokenColorCustomizations": {
          ...existingSettings["editor.tokenColorCustomizations"],
          textMateRules: [
            ...(existingSettings["editor.tokenColorCustomizations"]?.[
              "textMateRules"
            ] || []),
            ...newSettings["editor.tokenColorCustomizations"]["textMateRules"],
          ],
        },
      };

      await createFile(
        ".vscode/settings.json",
        JSON.stringify(mergedSettings, null, 2)
      );
      console.info("VS Code settings updated successfully");
    } catch (error) {
      console.error("Error updating VS Code settings:", error);
      throw error;
    }
  }

  return {
    initSchemaFormat,
  };
}
