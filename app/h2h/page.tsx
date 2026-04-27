// app/h2h/page.tsx
import { supabase } from '@/lib/supabase';
import { H2HClient } from '@/components/h2h-client';

import { cookies } from 'next/headers';

export default async function H2HPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const isAdmin = token === process.env.ADMIN_PASSWORD;

  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false });

  return <H2HClient initialMatches={matches ?? []} isAdmin={isAdmin} />;
}