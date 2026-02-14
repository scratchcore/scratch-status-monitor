import z from "zod";

/**
 * タイトルの設定
 */
const titleTemplateSchema = z.object({
  /**
   * デフォルトのタイトル。タイトルが指定されていない場合に使用されます。
   *
   * 例: `"MySite"` とすると、タイトルが指定されていないページは "MySite" になります。
   */
  default: z.string().optional(),
  /**
   * タイトルのテンプレート。`%s` がタイトルのプレースホルダーになります。
   *
   * 例: `"%s | MySite"` とすると、タイトルが "Home" の場合は "Home | MySite" になります。
   */
  template: z.string().optional(),
});
type _TitleTemplateType = z.infer<typeof titleTemplateSchema>;

const ogpSchema = z.object({
  mode: z.enum(["use-head-content", "none"]),
});
type _OGPConfigType = z.infer<typeof ogpSchema>;

const configsSchema = z.object({
  titleTemplate: titleTemplateSchema.optional(),
  ogp: ogpSchema.optional(),
});
type _ConfigsType = z.infer<typeof configsSchema>;

export const ConfigsSchema = {
  index: configsSchema,
  titleTemplate: titleTemplateSchema,
  ogp: ogpSchema,
};
export namespace ConfigsType {
  export type TitleTemplateConfig = _TitleTemplateType;
  export type OGPConfig = _OGPConfigType;
  export type Configs = _ConfigsType;
}
