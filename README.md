# Scratch Status Monitor

> [!IMPORTANT]
> [https://scratchstats.com](https://scratchstats.com) プロジェクトとは関係ありません。

このプロジェクトは、[Scratch](https://scratch.mit.edu) サービスの様々な機能の稼働状況を監視して、ユーザーにわかりやすく伝えることをもう的としています。

## Backend

バックエンドは [Hono + TypeScript](https://hono.dev) 構成を使用しています。

定期的な稼働状況の確認を行い、[WS](https://developer.mozilla.org/ja/docs/Web/API/WebSocket) を用いいてフロントエンドへ情報を送信しています。

## Frontend

[Next.js v15](https://nextjs.org) の予定。
