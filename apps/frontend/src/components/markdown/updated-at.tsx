import { RiCalendarEventLine } from "@remixicon/react";
import { getIntlayer } from "react-intlayer";
import { Pill, PillStatus } from "../kibo-ui/pill";

export const UpdatedAtContent = ({
  updated_at,
  locale,
}: {
  updated_at?: string;
  locale: string;
}) => {
  const t = getIntlayer("word", locale);
  return (
    <Pill className="mt-4 mb-8">
      <PillStatus>
        <RiCalendarEventLine size={12} />
        {t.lastUpdated}
      </PillStatus>
      {updated_at
        ? new Date(updated_at).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A"}
    </Pill>
  );
};
