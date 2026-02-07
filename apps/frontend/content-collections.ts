import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import { z } from "zod";

const content = defineCollection({
  name: "content",
  directory: "content",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    updated: z.string().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, {
      rehypePlugins: [],
      remarkPlugins: [remarkGfm],
    });
    return {
      ...document,
      mdx,
    };
  },
});

export default defineConfig({
  collections: [content],
});
