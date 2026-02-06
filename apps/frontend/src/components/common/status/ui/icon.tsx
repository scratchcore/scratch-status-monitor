import {
  RiCheckboxCircleFill,
  RiErrorWarningFill,
  RiIndeterminateCircleLine,
  RiSettings5Fill,
} from "@remixicon/react";
import { colorMapping } from "@/lib/status-page/rc";

export const StatusIcon = ({
  tooltip,
  className,
}: {
  tooltip: keyof typeof colorMapping;
  className?: string;
}) => {
  if (tooltip === "Operational") {
    return (
      <RiCheckboxCircleFill
        className={className ?? "size-5 shrink-0 text-emerald-500"}
        aria-hidden={true}
      />
    );
  }
  if (tooltip === "Maintenance") {
    return (
      <RiSettings5Fill
        className={className ?? "size-5 shrink-0 text-amber-500"}
        aria-hidden={true}
      />
    );
  }
  if (tooltip === "Downtime") {
    return (
      <RiErrorWarningFill
        className={className ?? "size-5 shrink-0 text-red-500"}
        aria-hidden={true}
      />
    );
  }
  return (
    <RiIndeterminateCircleLine
      className={className ?? "size-5 shrink-0 text-gray-500"}
      aria-hidden={true}
    />
  );
};
