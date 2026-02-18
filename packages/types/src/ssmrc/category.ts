import z from "zod";

const __category = z.object({
  id: z.string(),
  label: z.string(),
});
type __categoryType = z.infer<typeof __category>;

export const _categorySchema = {
  i: __category,
};
export namespace _categoryType {
  export type i = __categoryType;
}
