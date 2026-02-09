import type React from "react";

declare module "react" {
  function forwardRef<T, P extends Record<string, unknown> = Record<string, unknown>>(
    render: (props: P, ref: React.ForwardedRef<T>) => JSX.Element | null
  ): (props: P & React.RefAttributes<T>) => JSX.Element | null;
}
