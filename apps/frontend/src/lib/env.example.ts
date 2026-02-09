/**
 * envrc プラグインの使用例
 *
 * envrc.ts で環境変数を定義し、型安全にアクセスできます。
 * checkEnvOnStartup() を起動時に呼び出すと、環境変数が検証されカナッシュされます。
 * その後、getEnv() は常に有効な環境変数オブジェクトを返します。
 */

import { createServerFn } from "@tanstack/react-start";
import { getEnv } from "@/plugins/envrc";

// ============================================
// 例1: サーバー起動後は常に有効な環境変数を取得
// ============================================
export function example1() {
  // checkEnvOnStartup() で検証済みなので、常に有効な Env オブジェクトが返される
  const env = getEnv();

  // required: true の環境変数は string | undefined ではなく string 型
  console.log("Backend URL:", env.VITE_BACKEND_URL); // string型、常に値がある
  console.log("Node環境:", env.ENVIRONMENT); // 記事に Env 型による型チェック
}

// ============================================
// 例2: Server Function 内での使用
// ============================================
export const getConfigServerFn = createServerFn().handler(async () => {
  const env = getEnv();

  // required: true の環境変数には直接アクセス可能
  return {
    backendUrl: env.VITE_BACKEND_URL,
    apiToken: env.API_TOKEN,
  };
});

// ============================================
// 例3: React コンポーネントでの使用
// ============================================
/*
export function ExampleComponent() {
	const env = getEnv();

	return (
		<div>
			<p>Backend URL: {env.VITE_BACKEND_URL}</p>
		</div>
	);
}
*/
