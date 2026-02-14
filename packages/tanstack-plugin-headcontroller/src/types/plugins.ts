import type { DetailedHTMLProps, MetaHTMLAttributes } from "react";

type MetaResult =
  | DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>
  | undefined;
type PluginFunction = (ctx: Record<string, any>, m: MetaResult) => PluginsType.head.meta.result;

export namespace PluginsType {
  export namespace head {
    export namespace meta {
      export type func = PluginFunction;
      export type options = {
        ctx: Record<string, any>;
        m: MetaResult;
      };
      export type result = MetaResult;
    }
  }
}
