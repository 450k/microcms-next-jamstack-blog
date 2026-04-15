// app/h2h/page.tsx
import { supabase } from '@/lib/supabase';
import { H2HClient } from '@/components/h2h-client';

export default async function H2HPage() {
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false });

  return <H2HClient initialMatches={matches ?? []} />;
}