# Scratch Status Monitor

> [!IMPORTANT]
> [https://scratchstats.com](https://scratchstats.com) プロジェクトとは関係ありません。

このプロジェクトは、[Scratch](https://scratch.mit.edu) サービスの様々な機能の稼働状況を監視して、ユーザーにわかりやすく伝えることを目的としています。

## Backend

バックエンドは [Hono + TypeScript](https://hono.dev) 構成を使用しています。

定期的な稼働状況の確認を行い、[WS](https://developer.mozilla.org/ja/docs/Web/API/WebSocket) を用いいてフロントエンドへ情報を送信しています。

## Frontend

[Next.js v15](https://nextjs.org) の予定。

## ライセンス

- Backend は [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) が適応されています。
- Frontend は [Apache 2.0](https://choosealicense.com/licenses/apache-2.0/) が適応されています。
