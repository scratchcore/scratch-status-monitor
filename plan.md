
1. 定期チェック（Cloudflare Workers Cron）で状態を取得し Workers KV（あるいは Cache API）に保存。
2. Hono のルートで保存済みのスナップショットを読み取り、HTML をサーバー側で生成して返す。（内容の更新はとりあえず、ページリロード）
