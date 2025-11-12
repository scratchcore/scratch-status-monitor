# Scratch Status Monitor with Cloudflare

## 前提

| 項目                   | 値   |
| ---------------------- | ---- |
| パッケージマネージャー | pnpm |

### 構成

- Hono
- TypeScript
- Cloudflare Workers

### 機能

- [cf kv](https://developers.cloudflare.com/kv/)
- [cf cron-triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)

## 概要

[Scratch](https://scratch.mit.edu/) サービスの非公式ステータスモニターサービスです。`cron` で定期的に計測を行い、`kv` でデータの管理をします。
サーバーと、クライアントを Hono で完結させるために、[HTML Helper](https://hono.dev/docs/helpers/html) を活用します。
