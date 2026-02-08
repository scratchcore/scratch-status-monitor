import type { AnyRouteMatch } from "@tanstack/react-router";

type HeadPayload = {
  meta?: AnyRouteMatch["meta"];
  links?: AnyRouteMatch["links"];
  scripts?: AnyRouteMatch["scripts"];
  styles?: AnyRouteMatch["styles"];
};

const mergeEntries = <T>(current: T[] | undefined, next: T[] | undefined) => {
  if (!next || next.length === 0) {
    return current;
  }

  return [...(current ?? []), ...next];
};

export const mergeHead = (...heads: Array<HeadPayload | null | undefined | false>): HeadPayload => {
  let meta: AnyRouteMatch["meta"] | undefined;
  let links: AnyRouteMatch["links"] | undefined;
  let scripts: AnyRouteMatch["scripts"] | undefined;
  let styles: AnyRouteMatch["styles"] | undefined;

  for (const head of heads) {
    if (!head) {
      continue;
    }

    meta = mergeEntries(meta, head.meta);
    links = mergeEntries(links, head.links);
    scripts = mergeEntries(scripts, head.scripts);
    styles = mergeEntries(styles, head.styles);
  }

  return {
    ...(meta ? { meta } : {}),
    ...(links ? { links } : {}),
    ...(scripts ? { scripts } : {}),
    ...(styles ? { styles } : {}),
  };
};

export const whenHead = <T>(
  value: T | null | undefined,
  build: (value: T) => HeadPayload
): HeadPayload | undefined => (value == null ? undefined : build(value));
