import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// RLSをバイパスするサーバー専用クライアント（membersテーブル用）
// クライアントコンポーネントから import しないこと
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
      auth: { persistSession: false },
    });
  }
  return client;
}
