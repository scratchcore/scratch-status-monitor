import { cache } from "./cache";
import { category } from "./category";
import { checks } from "./checks";
import { monitors } from "./monitor";
import { ssmrcType } from "./types";

export const ssmrc: ssmrcType.rc = {
  category,
  monitors,
  checks,
  cache,
};
