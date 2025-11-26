export type Monitor = { title?: string; url: string };

// Default monitors. You can edit this file or replace with a JSON/YML asset.
const monitors: Monitor[] = [
  { title: "Scratch Website", url: "https://scratch.mit.edu" },
  { title: "Scratch API", url: "https://api.scratch.mit.edu" },
  {
    title: "Scratch Clouddata",
    url: "https://clouddata.scratch.mit.edu/logs?projectid=60917032&limit=40&offset=0",
  },
];

export default monitors;
