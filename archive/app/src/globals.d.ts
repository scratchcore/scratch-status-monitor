// Minimal ambient declarations to satisfy TypeScript in the Worker-like environment used by Cloudflare
declare const URL: any;
declare const Request: any;
declare const Response: any;
declare const AbortController: any;
declare const caches: any;
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number): any;
declare function clearTimeout(id: any): void;

// Also allow globalThis.caches, etc.
declare namespace NodeJS {
  interface Global {
    caches?: any;
    AbortController?: any;
  }
}
