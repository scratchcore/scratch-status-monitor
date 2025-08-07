このプロジェクトは、[Scratch](https://scratch.mit.edu) サービスの様々な機能の稼働状況を監視して、ユーザーにわかりやすく伝えることを目的としています。

## はじめに

リソースの節約と、運用費用を抑えるためこの API を一般公開することは推奨されません。

### 注意事項

### クリエパラメーター

クリエパラメーターを正しく設定していない場合（例：'/v1/test?id='）は、API 共通のレスポンス型と一部異なり、zod の `ZodError` 型になります。

---

Scratchは、MITメディアラボのLifelong Kindergartenグループによって開発されました。詳細は [https://scratch.mit.edu](https://scratch.mit.edu) をご覧ください。
