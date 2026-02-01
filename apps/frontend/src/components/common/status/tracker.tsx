import { forwardRef } from "react";
import type { TrackerProps } from "@/components/ui/tracker";
import { cx } from "@/lib/utils";
import { type MemoryBlockProps, TrackerMemoryBlock } from "./tracker_memory_block";

export const Tracker = forwardRef<HTMLDivElement, TrackerProps<MemoryBlockProps>>(
  (
    {
      data = [],
      defaultBackgroundColor = "bg-gray-400 dark:bg-gray-400",
      className,
      hoverEffect,
      ...props
    },
    forwardedRef,
  ) => {
    return (
      <div
        ref={forwardedRef}
        className={cx("group flex h-8 w-full items-center", className)}
        {...props}
      >
        {data.map((props, index) => (
          <TrackerMemoryBlock
            key={props.key ?? index}
            defaultBackgroundColor={defaultBackgroundColor}
            hoverEffect={hoverEffect}
            {...props}
          />
        ))}
      </div>
    );
  },
);
