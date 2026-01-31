import React from "react";

declare module "react" {
  function forwardRef<T, P = {}>(
    render: (props: P, ref: ForwardedRef<T>) => JSX.Element | null,
  ): (props: P & RefAttributes<T>) => JSX.Element | null;
}
