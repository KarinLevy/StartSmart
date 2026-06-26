import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

const missing = !supabaseUrl || !supabaseAnon;

if (missing) {
  console.error(
    '[StartSmart] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.\n' +
    'Copy .env.example → .env and fill in your Supabase project values.'
  );
}

// Create a real client when env vars are present, or a no-op stub that
// returns empty data so the app renders without crashing in dev.
export const supabase = missing
  ? buildStub()
  : createClient(supabaseUrl, supabaseAnon);

function buildStub() {
  const noop = () => Promise.resolve({ data: null, error: { message: 'Supabase not configured — check .env' } });
  const chain = {
    select: () => chain, insert: () => chain, update: () => chain,
    delete: () => chain, upsert: () => chain, eq: () => chain,
    single: () => chain, order: () => chain,
    then: (resolve) => resolve({ data: null, error: null }),
  };
  return {
    from: () => chain,
    auth: {
      getSession:        () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (_e, _cb) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp:            noop,
      signInWithPassword: noop,
      signOut:           noop,
      resetPasswordForEmail: noop,
    },
  };
}
