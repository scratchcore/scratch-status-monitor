import type { ContextType } from "../schema/context";

export const headControllerContextEdit = <T>(
  value: T,
  opts: ContextType.HeadControllerOptions
): ContextType.HeadControllerContext => {
  return {
    ...value,
    headController: {
      ...(value as any).headController,
      ...opts,
    },
  };
};
