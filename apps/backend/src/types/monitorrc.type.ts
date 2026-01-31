export namespace MonitorConfigType {
  export interface Root {
    category: Category[];
    items: Item[];
  }
  export interface Category {
    id: string;
    label: string;
  }
  export interface Item {
    id: string;
    label: string;
    category: string;
    url: string;
  }
}
