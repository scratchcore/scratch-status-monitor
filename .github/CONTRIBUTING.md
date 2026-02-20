# 貢献方法

> [English](CONTRIBUTING.en.md) | 日本語

コミュニティからの貢献を歓迎します！このプロジェクトをより良くするために、以下の方法で貢献できます。

## 目次

- [行動規範](#行動規範)
- [問題の報告](#問題の報告)
- [プルリクエストの送信](#プルリクエストの送信)
- [セットアップ](#セットアップ)
- [開発フロー](#開発フロー)
- [コーディング規約](#コーディング規約)
- [テスト](#テスト)
- [コミットメッセージ](#コミットメッセージ)
- [レビュープロセス](#レビュープロセス)
- [質問がある場合](#質問がある場合)

## 行動規範

このプロジェクトとそのコミュニティに参加する方は、すべての人を尊重し、包括的で安全な環境を保つことに同意しています。以下を守ってください：

- 相互尊重と包括性を最優先にしてください
- 建設的で誠実なコミュニケーションを心がけてください
- 相手の視点を理解しようとしてください
- ハラスメントや差別は許容されません

## 問題の報告

バグやその他の問題を発見した場合は、GitHub の [Issues](../../issues) ページで報告してください。

### Issue の作成時に含めるべき情報

1. **明確なタイトル**: 問題を簡潔に説明してください
2. **詳細な説明**: 問題の詳細を記載してください
3. **再現手順**: 問題を再現するための具体的な手順を記載してください
4. **期待される動作**: 本来期待される動作を説明してください
5. **実際の動作**: 実際に発生している動作を説明してください
6. **環境情報**: OS、ブラウザ、バージョンなどの環境情報を記載してください
7. **スクリーンショット/ログ**: 可能であれば、スクリーンショットやエラーログを添付してください

詳細は [バグレポートテンプレート](ISSUE_TEMPLATE/bug_report.ja.md) を参照してください。

## プルリクエストの送信

### ステップバイステップガイド

1. **Fork する**

   ```bash
   GitHub でリポジトリをフォークしてください
   ```

2. **Clone する**

   ```bash
   git clone https://github.com/YOUR_USERNAME/scratch-status-monitor.git
   cd scratch-status-monitor
   ```

3. **upstream を設定**

   ```bash
   git remote add upstream https://github.com/scracc/scratch-status-monitor.git
   ```

4. **最新の状態に更新**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

5. **feature ブランチを作成**

   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **変更を加える**
   - コード品質とスタイルガイドラインに従ってください
   - テストを追加または更新してください
   - ドキュメントを更新してください（必要な場合）

7. **テストを実行**

   ```bash
   pnpm test
   ```

8. **コミットとプッシュ**

   ```bash
   git add .
   git commit -m "feat: 変更の説明"
   git push origin feature/your-feature-name
   ```

9. **プルリクエストを作成**

   - GitHub で Pull Request を作成してください
   - [プルリクエストテンプレート](PULL_REQUEST_TEMPLATE.ja.md) に従って情報を記入してください
   - レビュアーへの説明を詳記してください

## セットアップ

### 前提条件

- Node.js 20+
- pnpm 8+

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/scracc/scratch-status-monitor.git
cd scratch-status-monitor

# 依存関係をインストール
pnpm install

# ワークスペースのセットアップ
pnpm setup
```

### 開発サーバーの起動

```bash
# すべてのプロジェクトを起動
pnpm dev

# または特定のプロジェクトだけを起動
cd apps/frontend && pnpm dev
cd apps/backend && pnpm dev
```

## 開発フロー

1. Git フロー に従ってください：`main` ブランチは常に本番環境で動作するコードを含みます
2. feature ブランチは `main` から作成してください
3. 定期的に upstream を同期してください
4. ローカルでテストしてから PR を作成してください

## コーディング規約

このプロジェクトは以下のツールでコード品質を維持しています：

- **Biome**: コードのフォーマットと lint
- **TypeScript**: 型安全性
- **ESLint**: JavaScript の lint（Biome で統合されています）

### コード品質の確認

```bash
# Biome で自動フォーマット
pnpm format

# Biome で lint チェック
pnpm lint

# 型チェック
pnpm type-check
```

### コーディングスタイル

- **言語**: TypeScript/JavaScript は英語でコメントを書いてください
- **命名規則**:
  - 変数・関数: camelCase
  - クラス・型: PascalCase
  - 定数: UPPER_SNAKE_CASE
- **ファイル名**: kebab-case

詳細は [biome.json](../biome.json) を参照してください。

## テスト

### テストの実行

```bash
# すべてのテストを実行
pnpm test

# ウォッチモードでテストを実行
pnpm test:watch

# カバレッジレポートを生成
pnpm test:coverage
```

### テストの追加

- 新しいコード変更には、対応するテストを追加してください
- テストは `*.test.ts` または `*.spec.ts` の名前で作成してください
- テストカバレッジは 80% 以上を目指してください

## コミットメッセージ

Conventional Commits を使用しています。以下の形式に従ってください：

```txt
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- **feat**: 新しい機能
- **fix**: バグ修正
- **docs**: ドキュメント変更
- **style**: コード形式変更（機能に影響しない）
- **refactor**: リファクタリング
- **perf**: パフォーマンス改善
- **test**: テスト関連の変更
- **chore**: ビルドプロセスやツールの変更
- **ci**: CI/CD の設定変更

### Scope

変更が影響する領域：

- `frontend`: フロントエンド
- `backend`: バックエンド
- `api`: API
- `docs`: ドキュメント
- `config`: 設定ファイル

### 例

```txt
feat(frontend): 新しいダッシュボードコンポーネントを追加

ダッシュボードの表示性能を向上させるための新しいコンポーネント

Closes #123
```

## レビュープロセス

1. **自動チェック**: GitHub Actions で自動テストと lint チェックが実行されます
2. **レビュー**: メンテナーが PR をレビューします
3. **修正**: 指摘事項を修正してください
4. **承認**: レビューが通ると、マージされます

### PR がマージされるための条件

- [ ] すべてのチェック（テスト、lint）が成功している
- [ ] 少なくとも 1 人のメンテナーから承認されている
- [ ] すべてのコメントが解決されている
- [ ] ブランチが最新の `main` にあわせて更新されている

## 質問がある場合

- GitHub Discussions で質問してください
- Issue で明確に説明されていない場合は、コメントで質問してください
- セキュリティに関する問題は、公開せず直接報告してください

---

ご協力ありがとうございます！🙏
