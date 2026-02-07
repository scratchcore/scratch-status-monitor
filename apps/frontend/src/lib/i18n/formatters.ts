type SupportedLocale = "ja" | "en";

/**
 * ロケールをIntl用のロケール文字列に変換
 */
export function localeToIntl(locale: SupportedLocale): string {
  const localeMap: Record<SupportedLocale, string> = {
    ja: "ja-JP",
    en: "en-US",
  };

  return localeMap[locale] || "ja-JP";
}

/**
 * ロケールに応じた短い日付フォーマッター
 * ユーザーのタイムゾーンで表示
 */
export function getShortDateFormatter(locale: SupportedLocale) {
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
export function getFullDateTimeFormatter(locale: SupportedLocale) {
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
export function getMonthDayFormatter(locale: SupportedLocale) {
  const intlLocale = localeToIntl(locale);
  return new Intl.DateTimeFormat(intlLocale, {
    month: "short",
    day: "2-digit",
  });
}

/**
 * ロケールに応じた時刻フォーマッター
 */
export function getTimeFormatter(locale: SupportedLocale) {
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
export function formatDateShort(value: string, locale: SupportedLocale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return getShortDateFormatter(locale).format(date);
}

/**
 * 日時を完全な形式でフォーマット
 * @param value ISO 8601形式の日付文字列
 * @param locale ロケール
 */
export function formatDateTime(value: string, locale: SupportedLocale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return getFullDateTimeFormatter(locale).format(date);
}

/**
 * 数値をロケールに応じてフォーマット
 * @param value 数値
 * @param locale ロケール
 */
export function formatNumber(value: number, locale: SupportedLocale): string {
  const intlLocale = localeToIntl(locale);
  return value.toLocaleString(intlLocale);
}
