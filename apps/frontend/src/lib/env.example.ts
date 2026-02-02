/**
 * envrc プラグインの使用例
 * 
 * envrc.ts で環境変数を定義し、型安全にアクセスできます。
 * このファイルは実際のコードには含めず、参考用として保持してください。
 */

import { createServerFn } from "@tanstack/react-start";
import { getClientEnv, getEnv, getServerEnv } from "@/plugins/envrc";

// ============================================
// 例1: すべての環境変数を取得（エラーハンドリング付き）
// ============================================
export function example1() {
	const env = getEnv();

	if (!env) {
		console.error("環境変数の取得に失敗しました");
		return;
	}

	console.log("Backend URL:", env.VITE_BACKEND_URL);
	console.log("Node環境:", env.NODE_ENV || "未設定");
}

// ============================================
// 例2: エラー時に例外をスロー
// ============================================
export function example2() {
	try {
		// 環境変数が不正な場合は例外をスロー
		const env = getEnv({ throwOnError: true as const });

		// ここに到達するときは必ず env が存在する（null チェック不要）
		console.log("Backend URL:", env.VITE_BACKEND_URL);
	} catch (error) {
		console.error("環境変数エラー:", error);
		// エラーハンドリング
	}
}

// ============================================
// 例3: サーバー側専用（Server Function内など）
// ============================================
export function example3ServerOnly() {
	// サーバー側でのみ実行可能
	if (typeof process === "undefined") {
		throw new Error("This function can only run on the server");
	}

	const env = getServerEnv({ throwOnError: true });
	console.log("Server環境変数:", env);
}

// ============================================
// 例4: クライアント側専用（ブラウザコンポーネント内など）
// ============================================
export function example4ClientOnly() {
	// クライアント側の環境変数のみ取得
	const env = getClientEnv();

	if (!env) {
		console.warn("環境変数が設定されていません");
		return;
	}

	console.log("Client環境変数:", env);
}

// ============================================
// 例5: React コンポーネントでの使用
// ============================================
/*
export function ExampleComponent() {
	const env = getEnv({ throwOnError: false });

	return (
		<div>
			<p>Backend URL: {env?.VITE_BACKEND_URL || "Not configured"}</p>
		</div>
	);
}
*/

// ============================================
// 例6: Server Function での使用
// ============================================
export const fetchDataServerFn = createServerFn({ method: "GET" }).handler(
	async () => {
		// サーバー側で環境変数を取得（throwOnError で null チェック不要）
		const env = getServerEnv({ throwOnError: true });
		const response = await fetch(`${env.VITE_BACKEND_URL}/api/data`);
		return response.json();
	},
);
