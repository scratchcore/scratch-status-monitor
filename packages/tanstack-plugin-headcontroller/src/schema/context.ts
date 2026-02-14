import z from "zod";
import { ConfigsSchema } from "./config";

const HeadControllerOptionsSchema = z.object({
  configs: ConfigsSchema.index.optional(),
});
type _HeadControllerOptions = z.infer<typeof HeadControllerOptionsSchema>;
const HeadControllerContextSchema = z.object({
  headController: HeadControllerOptionsSchema,
});
type _HeadControllerContext = z.infer<typeof HeadControllerContextSchema>;

export const ContextSchema = {
  index: HeadControllerContextSchema,
  options: HeadControllerOptionsSchema,
};
export namespace ContextType {
  export type HeadControllerContext = _HeadControllerContext;
  export type HeadControllerOptions = _HeadControllerOptions;
}
