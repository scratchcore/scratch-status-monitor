import { configuration } from "intlayer";

export const locales = configuration.internationalization.locales;
export type LocalesType = typeof locales;
export const localeCodeMap = locales.map((locale) => locale.split("-")[0]);
export type LocaleCodeType = (typeof localeCodeMap)[number];
export type LocaleCodeMapType = LocaleCodeType[];

/**
 * ロケールをIntl用のロケール文字列に変換
 */
export function localeToIntl(locale: LocaleCodeType): string {
  return locales.find((l) => l.startsWith(locale)) ?? locale;
}

/**
 * ロケールに応じた短い日付フォーマッター
 * ユーザーのタイムゾーンで表示
 */
export function getShortDateFormatter(locale: LocaleCodeType) {
  const intlLocale = localeToIntl(locale);
  return new Intl.DateTimeFormat(intlLocale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * ロケールに応じた完全な日時フォーマッター
 * ユーザーのタイムゾーンで表示
 */
export function getFullDateTimeFormatter(locale: LocaleCodeType) {
  const intlLocale = localeToIntl(locale);
  return new Intl.DateTimeFormat(intlLocale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * ロケールに応じた月日フォーマッター
 */
export function getMonthDayFormatter(locale: LocaleCodeType) {
  const intlLocale = localeToIntl(locale);
  return new Intl.DateTimeFormat(intlLocale, {
    month: "short",
    day: "2-digit",
  });
}

/**
 * ロケールに応じた時刻フォーマッター
 */
export function getTimeFormatter(locale: LocaleCodeType) {
  const intlLocale = localeToIntl(locale);
  return new Intl.DateTimeFormat(intlLocale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * 日付を短い形式でフォーマット
 * @param value ISO 8601形式の日付文字列
 * @param locale ロケール
 */
export function formatDateShort(value: string, locale: LocaleCodeType): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return getShortDateFormatter(locale).format(date);
}

/**
 * 日時を完全な形式でフォーマット
 * @param value ISO 8601形式の日付文字列
 * @param locale ロケール
 */
export function formatDateTime(value: string, locale: LocaleCodeType): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return getFullDateTimeFormatter(locale).format(date);
}

/**
 * 数値をロケールに応じてフォーマット
 * @param value 数値
 * @param locale ロケール
 */
export function formatNumber(value: number, locale: LocaleCodeType): string {
  const intlLocale = localeToIntl(locale);
  return value.toLocaleString(intlLocale);
}
