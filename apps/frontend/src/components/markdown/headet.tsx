import { RiInformationLine } from "@remixicon/react";
import { defaultLocale, getIntlayer } from "intlayer";
import { Alert, AlertDescription } from "../ui/alert";

export function HeaderNotice({ locale, isDefault }: { locale: string; isDefault: boolean }) {
  const t = getIntlayer("notice", locale);
  let content = "";
  const isDefaultLocale = locale === defaultLocale;

  if (isDefaultLocale) {
    return null;
  }

  if (isDefault) {
    content = t.isDefault;
  } else {
    content = t.isNotDefaultLocaleContent;
  }

  return (
    <Alert>
      <RiInformationLine />
      <AlertDescription>{content}</AlertDescription>
    </Alert>
  );
}
