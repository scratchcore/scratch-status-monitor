import { MonitorConfigType } from "~/src/types/motior";

export const MonitorConfig: MonitorConfigType = {
  category: [
    {
      id: "main",
      label: "Main",
    },
    {
      id: "siteapi",
      label: "Site API",
    },
    {
      id: "api",
      label: "API",
    },
  ],
  items: [
    {
      id: "c79c0e1e-8292-45ee-8dba-58e672d32184",
      title: "Website",
      category: "main",
      url: "https://scratch.mit.edu",
    },
    {
      id: "7de6ff07-02d7-4e00-afd7-5bc1c292a098",
      title: "API",
      category: "main",
      url: "https://api.scratch.mit.edu",
    },
    {
      id: "a76fe285-5171-4f9c-876e-8a4230267e83",
      title: "User Activity",
      category: "siteapi",
      url: "https://scratch.mit.edu/messages/ajax/user-activity/?user=griffpatch&max=1",
    },
    {
      id: "41fe485e-05a3-4bdd-b7e4-94b2fce1de74",
      title: "Profile Comments",
      category: "siteapi",
      url: "https://scratch.mit.edu/site-api/comments/user/griffpatch/?page=1",
    },
    {
      id: "72c6be4f-0a48-4a09-9117-41b956f6072f",
      title: "Explore API",
      category: "api",
      url: "https://api.scratch.mit.edu/explore/projects?limit=1&offset=0&language=en&mode=trending&q=*",
    },
    {
      id: "02c50c46-12fa-4e97-8ac2-cbdc6d0752e9",
      title: "Search API",
      category: "api",
      url: "https://api.scratch.mit.edu/search/projects?limit=1&offset=0&language=en&mode=popular&q=cat",
    },
    {
      id: "1a394936-53de-4a24-b221-058361c0a8ab",
      title: "Clouddata",
      category: "api",
      url: "https://clouddata.scratch.mit.edu/logs?projectid=60917032&limit=40&offset=0",
    },
  ],
};
