import { RiTranslate2 } from "@remixicon/react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { getLocaleName, getPathWithoutLocale, getPrefix } from "intlayer";
import type { FC } from "react";
import { useLocale } from "react-intlayer";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { FileRouteTypes } from "@/routeTree.gen";
import { LOCALE_ROUTE } from "./LocalizedLink";
import { InputGroupAddon } from "./ui/input-group";

export const LocaleSwitcher: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { availableLocales, locale, setLocale } = useLocale();

  const pathWithoutLocale = getPathWithoutLocale(pathname) || "/";
  const normalizedPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;

  const handleLocaleChange = (nextLocale: string | null) => {
    if (!nextLocale || nextLocale === locale) {
      return;
    }

    setLocale(nextLocale);

    const localizedTo = `/${LOCALE_ROUTE}${normalizedPath}` as FileRouteTypes["to"];
    const { localePrefix } = getPrefix(nextLocale);

    void navigate({
      to: localizedTo,
      params: { locale: localePrefix },
    });
  };

  const languages = availableLocales.map((lang) => ({
    label: getLocaleName(lang),
    value: lang,
  }));

  return (
    <Combobox
      items={languages}
      itemToStringValue={(lang: (typeof languages)[number]) => lang.label}
      value={languages.find((l) => l.value === locale)}
      onValueChange={(e) => (e ? handleLocaleChange(e?.value) : void 0)}
    >
      <ComboboxInput className="w-fit max-w-40" placeholder="Select a language">
        <InputGroupAddon>
          <RiTranslate2 />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent className="w-40">
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="truncate">{item.label}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
