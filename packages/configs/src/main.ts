import { cache } from "./cache";
import { category } from "./category";
import { history } from "./history";
import { monitors } from "./monitor";
import { ssmrcType } from "./types";

export const ssmrc: ssmrcType.rc = {
  category,
  monitors,
  history,
  cache,
};
