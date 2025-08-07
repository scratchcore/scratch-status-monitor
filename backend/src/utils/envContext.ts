export type EnvKeys = "NODE_ENV" | "API_URL";

export type EnvMap = {
  NODE_ENV: "production" | "development" | "preview";
  API_URL: string;
};

export class EnvStore {
  private store = new Map<EnvKeys, any>();

  set<K extends EnvKeys>(key: K, value: EnvMap[K]) {
    this.store.set(key, value);
  }

  get<K extends EnvKeys>(key: K): EnvMap[K] | undefined {
    return this.store.get(key);
  }
}
