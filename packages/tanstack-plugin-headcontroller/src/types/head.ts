import type { AnyRouteMatch } from "@tanstack/react-router";

type __Meta = AnyRouteMatch["meta"];
type __Links = AnyRouteMatch["links"];
type __Scripts = AnyRouteMatch["scripts"];
type __Styles = AnyRouteMatch["styles"];

type __Head = {
  meta?: __Meta;
  links?: __Links;
  scripts?: __Scripts;
  styles?: __Styles;
};

export namespace HeadType {
  export type index = __Head;
  export type Meta = __Meta;
  export type Links = __Links;
  export type Scripts = __Scripts;
  export type Styles = __Styles;
}
