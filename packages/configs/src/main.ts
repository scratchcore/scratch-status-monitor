import { cache } from "./cache";
import { category } from "./category";
import { history } from "./history";
import { monitors } from "./monitor";
import { scracsmConfigType } from "./types";

export const scracsmrc: scracsmConfigType.rc = {
  category,
  monitors,
  history,
  cache,
};
