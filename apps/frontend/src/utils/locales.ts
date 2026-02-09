import { configuration } from "intlayer";

export const SUPPORTED_LOCALES = configuration.internationalization?.locales ?? [];

export const DEFAULT_LOCALE = configuration.internationalization?.defaultLocale ?? "ja";
