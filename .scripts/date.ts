#!/usr/bin/env node
import { input } from "@inquirer/prompts";

const inputLocale = await input({ message: 'Enter locale (e.g. "ja-JP")', default: "ja-JP" });
const outputLocale = new Intl.Locale(inputLocale);
const inputTimeZone = await input({
  message: 'Enter time zone (e.g. "Asia/Tokyo")',
  default: "Asia/Tokyo",
});
const inputDate = await input({
  message: "Enter date",
  default: new Date().toLocaleString(inputLocale),
});

const output = new Intl.DateTimeFormat(outputLocale, {
  timeZone: inputTimeZone,
}).format(new Date(inputDate));

const date = new Date(output);
const ISODate = date.toISOString();

console.log(`
Input Locale: ${inputLocale}
Input Time Zone: ${inputTimeZone}
Input Date: ${inputDate}
Output Date: ${output}
ISO Date: ${ISODate}
`);
