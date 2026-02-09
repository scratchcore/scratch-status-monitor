import { cache } from "./cache";
import { category } from "./category";
import { checks } from "./checks";
import { monitors } from "./monitor";
import { shortUrls } from "./short-urls";
import type { ssmrcType } from "./types";

export const ssmrc: ssmrcType.rc = {
  category,
  monitors,
  checks,
  cache,
  shortUrls,
};
