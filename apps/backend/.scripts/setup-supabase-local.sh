#!/bin/bash
# Supabase ローカル開発環境のセットアップスクリプト

echo "🚀 Supabase local dev setup"

# ステータス確認
echo ""
echo "📋 Supabase status:"
supabase status

# マイグレーション実行
echo ""
echo "📝 Running migrations..."
supabase migration up

echo ""
echo "✅ Setup complete!"
echo ""
echo "📌 Next steps:"
echo "1. Copy Supabase credentials from above to .dev.vars"
echo "   - SUPABASE_URL: Copy the 'API URL' value"
echo "   - SUPABASE_SERVICE_ROLE_KEY: Copy the 'service_role key' value"
echo ""
echo "2. Start the backend:"
echo "   nr dev"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:8787/"
