import z from "zod";

const __monitorCheckSchema = z.union([
  z.object({
    type: z.literal("length"),
    expect: z
      .object({
        min: z.number().int().min(0).optional(),
        max: z.number().int().min(0).optional(),
      })
      .partial(),
  }),
  z.object({
    type: z.literal("status"),
    expected: z.number().int().min(100).max(599),
  }),
]);
type __monitorCheckType = z.infer<typeof __monitorCheckSchema>;

const __monitorSchema = z.object({
  id: z.uuid(),
  label: z.string(),
  category: z.string(),
  url: z.string(),
  check: __monitorCheckSchema.optional(),
});
type __monitorType = z.infer<typeof __monitorSchema>;

export const _monitorsSchema = {
  i: __monitorSchema,
  e: {
    check: __monitorCheckSchema,
  },
};
export namespace _monitorsType {
  export type i = __monitorType;
  export namespace e {
    export type check = __monitorCheckType;
  }
}
