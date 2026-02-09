// Tremor Callout [v0.0.1]

import { cva, type VariantProps } from "class-variance-authority";
import React from "react";

import { cx } from "@/lib/utils";

const calloutVariants = cva(
  "not-typography flex flex-col overflow-hidden rounded-md mt-5 p-4 text-sm",
  {
    variants: {
      variant: {
        default: [
          // text color
          "text-blue-900 dark:text-blue-400",
          // background color
          "bg-blue-100 dark:bg-blue-950/70",
        ],
        success: [
          // text color
          "text-emerald-900 dark:text-emerald-500",
          // background color
          "bg-emerald-100 dark:bg-emerald-950/70",
        ],
        error: [
          // text color
          "text-red-900 dark:text-red-500",
          // background color
          "bg-red-100 dark:bg-red-950/70",
        ],
        warning: [
          // text color
          "text-yellow-900 dark:text-yellow-500",
          // background color
          "bg-yellow-100 dark:bg-yellow-950/70",
        ],
        neutral: [
          // text color
          "text-gray-900 dark:text-gray-400",
          // background color
          "bg-gray-200 dark:bg-gray-800/70",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface CalloutProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof calloutVariants> {
  title: string;
  icon?: React.ElementType | React.ReactElement;
}

const Callout = React.forwardRef<HTMLDivElement, CalloutProps>(
  ({ title, icon: Icon, className, variant, children, ...props }: CalloutProps, forwardedRef) => {
    const isHeader = Boolean(Icon || title);
    return (
      <div
        ref={forwardedRef}
        className={cx(calloutVariants({ variant }), className)}
        tremor-id="tremor-raw"
        {...props}
      >
        {isHeader && (
          <div className={cx("flex items-start mb-2")}>
            {Icon && typeof Icon === "function" ? (
              <Icon className={cx("mr-1.5 h-5 w-5 shrink-0")} aria-hidden="true" />
            ) : (
              Icon
            )}
            <span className={cx("font-semibold")}>{title}</span>
          </div>
        )}
        <div className={cx("overflow-y-auto")}>{children}</div>
      </div>
    );
  }
);

Callout.displayName = "Callout";

export { Callout, calloutVariants, type CalloutProps };
