import type { ssmrcType } from "./types";

const ORG_NAME = "scratchcore";
const REPO_SLUG = "scratch-status-monitor";

export const shortUrls: ssmrcType.shortUrl[] = [
  {
    key: "gh/org",
    url: `https://github.com/${ORG_NAME}`,
  },
  // repository
  {
    key: "gh/repo",
    url: `https://github.com/${ORG_NAME}/${REPO_SLUG}`,
  },
  {
    key: "gh/issues",
    url: `https://github.com/${ORG_NAME}/${REPO_SLUG}/issues`,
  },
  {
    key: "gh/discussions",
    url: `https://github.com/${ORG_NAME}/${REPO_SLUG}/discussions`,
  },
  // graphs
  {
    key: "gh/contributors",
    url: `https://github.com/${ORG_NAME}/${REPO_SLUG}/graphs/contributors`,
  },
  // discussions categories
  {
    key: "gh/faq",
    url: `https://github.com/${ORG_NAME}/${REPO_SLUG}/discussions/categories/q-a`,
  },
];
