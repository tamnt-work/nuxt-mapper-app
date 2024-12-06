function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function mapType(type: string): string {
  if (!type) return "any";

  switch (type.toLowerCase()) {
    case "string":
      return "string";
    case "number":
      return "number";
    case "date":
      return "Date";
    case "boolean":
      return "boolean";
    default:
      return "any";
  }
}

function mapRelationType(type: string): string {
  if (type.endsWith("[]")) {
    return `${type.slice(0, -2)}Model[]`;
  }

  return `${type}Model`;
}

function generateNestedField(
  parts: string[],
  type: string,
  required: boolean | undefined
): string {
  const lastPart = parts[parts.length - 1];
  return `${parts[0]}${required ? "!" : "?"}: { ${lastPart}: ${mapType(
    type
  )} }`;
}

export default function useGenerator() {
  /**
   * Generate a model file
   * @param name - The name of the model
   * @param model - The model definition
   * @returns The model file content
   */
  function generateModelFile(name: string, model: SchemaModel) {
    const className = capitalizeFirst(name);
    const imports = Object.values(model.relationships || {})
      .filter((rel) => {
        const relationField = Object.keys(model.relationships || {}).find(
          (field) => model.relationships![field].type === rel.type
        );
        return relationField !== undefined;
      })
      .map((rel) => {
        const relationType = rel.type.endsWith("[]")
          ? rel.type.slice(0, -2)
          : rel.type;
        return `import { ${capitalizeFirst(
          relationType
        )}Model } from '../${relationType.toLowerCase()}/${relationType.toLowerCase()}.model';`;
      })
      .filter((value, index, self) => self.indexOf(value) === index)
      .join("\n");

    const content = `${imports}${imports ? "\n\n" : ""}
  export class ${className}Model {
    ${Object.entries(model.mappings)
      .map(
        ([field, def]) =>
          `${field}${def.required ? "!" : "?"}: ${mapType(def.type)};`
      )
      .join("\n  ")}
    ${Object.entries(model.relationships || {})
      .map(([field, def]) => `${field}?: ${mapRelationType(def.type)};`)
      .join("\n  ")}
  
    constructor(data: Partial<${className}Model> = {}) {
      Object.assign(this, data);
    }
  }
  
  export type ${className}PlainModel = Omit<${className}Model, 'constructor'>;
  `;
    return content.trim();
  }

  function generateDTOFile(name: string, model: SchemaModel) {
    const className = capitalizeFirst(name);
    const kebabFileName = name
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase();

    const imports = [
      `import { ${className}Model, type ${className}PlainModel } from './${kebabFileName}.model'`,
    ];

    if (model.relationships) {
      const relationshipImports = Object.values(model.relationships)
        .map((rel) => {
          const relationType = rel.type.endsWith("[]")
            ? rel.type.slice(0, -2)
            : rel.type;
          return `import { ${capitalizeFirst(
            relationType
          )}DTO } from '../${relationType.toLowerCase()}/${relationType.toLowerCase()}.dto';`;
        })
        .filter((value, index, self) => self.indexOf(value) === index);
      imports.push(...relationshipImports);
    }

    const content = `${imports.join("\n")}\n
  export class ${className}DTO {
    ${Object.entries(model.mappings)
      .map(([field, def]) => {
        const dtoField = def.map || field;

        if (dtoField.includes(".")) {
          const parts = dtoField.split(".");
          return generateNestedField(parts, def.type, def.required);
        }

        return `${dtoField}${def.required ? "!" : "?"}: ${mapType(def.type)};`;
      })
      .join("\n  ")}
    ${Object.entries(model.relationships || {})
      .map(([field, rel]) => {
        const relationType = rel.type.endsWith("[]")
          ? `${capitalizeFirst(rel.type.slice(0, -2))}DTO[]`
          : `${capitalizeFirst(rel.type)}DTO`;
        return `${field}?: ${relationType};`;
      })
      .join("\n  ")}
  
    constructor(data: Partial<${className}DTO> = {}) {
      Object.assign(this, data);
    }
  
    toModel(): ${className}Model {
      return new ${className}Model({
        ${Object.entries(model.mappings)
          .map(([field, def]) => {
            const dtoField = def.map || field;

            if (dtoField.includes(".")) {
              const parts = dtoField.split(".");
              return `${field}: this.${parts[0]}?.${parts[parts.length - 1]},`;
            }

            return `${field}: this.${dtoField},`;
          })
          .join("\n      ")}
        ${Object.entries(model.relationships || {})
          .map(([field, rel]) => {
            if (rel.type.endsWith("[]")) {
              return `${field}: this.${field}?.map(e => e.toModel()),`;
            }

            return `${field}: this.${field}?.toModel(),`;
          })
          .join("\n      ")}
      });
    }
  
    toPlainModel(): ${className}PlainModel {
      return {
        ${Object.entries(model.mappings)
          .map(([field, def]) => {
            const dtoField = def.map || field;

            if (dtoField.includes(".")) {
              const parts = dtoField.split(".");
              return `${field}: this.${parts[0]}?.${parts[parts.length - 1]},`;
            }

            return `${field}: this.${dtoField},`;
          })
          .join("\n      ")}
        ${Object.entries(model.relationships || {})
          .map(([field, rel]) => {
            if (rel.type.endsWith("[]")) {
              return `${field}: this.${field}?.map(e => e.toPlainModel()),`;
            }

            return `${field}: this.${field}?.toPlainModel(),`;
          })
          .join("\n      ")}
      };
    }
  }
  `;
    return content.trim();
  }

  async function generateModelAndDTO(modelNames?: string[]) {
    const { modelSchema, projectPath, createFile } = useFileStore();

    try {
      if (!projectPath) {
        console.warn("No project path found");
        return;
      }

      if (!modelSchema) {
        console.warn("No schema found");
        return;
      }

      const modelsToProcess = modelNames
        ? Object.entries(modelSchema).filter(([name]) =>
            modelNames.includes(name)
          )
        : Object.entries(modelSchema);

      if (modelsToProcess.length === 0) {
        console.warn("No models found in schema to process");
        return;
      }

      // Validate relationships
      modelsToProcess.forEach(([name, definition]) => {
        if (definition.type === "model" && definition.relationships) {
          Object.entries(definition.relationships).forEach(([field, rel]) => {
            const relationType = rel.type.endsWith("[]")
              ? rel.type.slice(0, -2)
              : rel.type;
            if (!modelSchema[relationType]) {
              throw new Error(
                `Error in model "${name}": Referenced model "${relationType}" in relationship "${field}" does not exist in schema`
              );
            }
          });
        }
      });

      // Generate files for each model
      for (const [name, definition] of modelsToProcess) {
        if (definition.type === "model") {
          const kebabCaseName = name
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .toLowerCase();
          const modelPath = `mappers/${kebabCaseName}/${kebabCaseName}.model.ts`;
          const dtoPath = `mappers/${kebabCaseName}/${kebabCaseName}.dto.ts`;

          // Generate and write model file
          const modelContent = generateModelFile(name, definition);
          await createFile(modelPath, modelContent);

          // Generate and write DTO file
          const dtoContent = generateDTOFile(name, definition);
          await createFile(dtoPath, dtoContent);

          console.info(`Generated files for model: ${name}`);
        }
      }
    } catch (error) {
      console.error("Error generating files:", error);
      throw error;
    }
  }

  return {
    generateModelFile,
    generateDTOFile,
    generateModelAndDTO,
  };
}
