import type { DetailedHTMLProps, MetaHTMLAttributes } from "react";

export namespace PluginsType {
  export namespace Head {
    export type Meta =
      | DetailedHTMLProps<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>
      | undefined;
  }
}
