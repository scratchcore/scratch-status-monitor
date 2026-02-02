import * as HoverCardPrimitives from "@radix-ui/react-hover-card";
import { RiCheckboxCircleFill, RiErrorWarningFill, RiSettings5Fill } from "@remixicon/react";
import { useState } from "react";
import type { TrackerBlockProps } from "@/components/ui/tracker";
import { cx } from "@/lib/utils";

export interface MemoryBlockProps extends TrackerBlockProps {
  date: string;
}

export const TrackerMemoryBlock = ({
  color,
  tooltip,
  date,
  hoverEffect,
  defaultBackgroundColor,
}: MemoryBlockProps) => {
  const [open, setOpen] = useState(false);
  return (
    <HoverCardPrimitives.Root open={open} onOpenChange={setOpen} openDelay={0} closeDelay={0}>
      <HoverCardPrimitives.Trigger onClick={() => setOpen(true)} asChild>
        <div className="size-full overflow-hidden px-[0.5px] transition first:rounded-l-lg first:pl-0 last:rounded-r-lg last:pr-0 sm:px-px">
          <div
            className={cx(
              "size-full rounded-[1px]",
              color || defaultBackgroundColor,
              hoverEffect ? "hover:opacity-50" : "",
            )}
          />
        </div>
      </HoverCardPrimitives.Trigger>
      <HoverCardPrimitives.Portal>
        <HoverCardPrimitives.Content
          sideOffset={10}
          side="top"
          align="center"
          avoidCollisions
          className={cx(
            // base
            "min-w-44 max-w-52 rounded-lg shadow-md",
            // text
            "text-gray-900 dark:text-gray-50",
            // background
            "bg-white dark:bg-[#090E1A]",
            // border
            "border border-gray-200 dark:border-gray-900",
          )}
        >
          <p className="flex items-center gap-2 px-3 py-2 text-sm font-medium">
            {tooltip === "Operational" ? (
              <RiCheckboxCircleFill
                className="size-5 shrink-0 text-emerald-500"
                aria-hidden={true}
              />
            ) : null}
            {tooltip === "Maintenance" ? (
              <RiSettings5Fill className="size-5 shrink-0 text-amber-500" aria-hidden={true} />
            ) : null}
            {tooltip === "Downtime" ? (
              <RiErrorWarningFill className="size-5 shrink-0 text-red-500" aria-hidden={true} />
            ) : null}
            {tooltip}
          </p>
          <div className="h-px w-full bg-gray-200 dark:bg-gray-800" aria-hidden={true} />
          <p className="px-3 py-2 text-xs text-gray-500 dark:text-gray-500">{date}</p>
        </HoverCardPrimitives.Content>
      </HoverCardPrimitives.Portal>
    </HoverCardPrimitives.Root>
  );
};
