// system
import path from "node:path";
import fs from "node:fs";
import yaml from "js-yaml";

// setting
import { projectConfig } from "project.config.js";

// Hono
import { app } from "@/index.js";
import { generateSpecs } from "hono-openapi";

/**
 * OpenAPI仕様書を生成する
 *
 * Docs: https://rc.honohub.dev/docs/openapi/persisting
 */
export async function generateOpenAPISpecs() {
  const specs = await generateSpecs(app, {
    documentation: {
      info: {
        title: projectConfig.title,
        version: projectConfig.version,
        description: fs.readFileSync(path.resolve("openapi.docs.md"), "utf-8"),
        contact: {
          name: "Developer",
          url: "https://github.com/scratchcore",
          email: "contact@scratchcore.org",
        },
        license: {
          name: "GNU AGPLv3",
          url: "https://choosealicense.com/licenses/agpl-3.0",
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "TXT",
            description: "Bearer Token",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [
        {
          url: `http://localhost:${projectConfig.port || 3000}`,
          description: "Local Server",
        },
      ],
      tags: [
        {
          name: "Examples",
          description: fs.readFileSync(
            path.resolve("src/tags/Examples.md"),
            "utf8",
          ),
        },
      ],
      externalDocs: {
        description: "GitHub",
        url: "https://github.com/scratchcore/scratch-status-monitor",
      },
    },
  });

  fs.writeFileSync("./public/openapi.yaml", yaml.dump(specs));
}
