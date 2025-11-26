export type MonitorCategory = {
  id: string;
  label?: string;
};

export type MonitorItem = {
  id: string;
  url: string;
  category?: MonitorCategory["id"];
  title?: string;
};

export type MonitorConfigType = {
  category: MonitorCategory[];
  items: MonitorItem[];
};
