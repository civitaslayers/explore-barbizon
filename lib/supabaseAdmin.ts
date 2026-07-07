import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

if (typeof window !== "undefined") {
  throw new Error("supabaseAdmin must never be imported in the browser");
}

// NOTE ON LAZY INIT: this must NOT construct the client (or validate env vars)
// at module-eval time. Next.js (16.x, Turbopack) evaluates the full module
// graph of any page using getServerSideProps during `next build`'s "Collecting
// page data" step — importing this module eagerly there would fail the build
// whenever SUPABASE_SECRET_KEY is absent, even though no request is being
// served. Construction/validation is deferred to first property access
// (i.e. first real use inside a request), which is the only place this module
// is meant to be touched (see pages/command-center/pins.tsx, pages/api/locations/[id].ts).
let cached: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Supabase admin client missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY"
    );
  }

  cached = createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const supabaseAdmin: SupabaseClient<Database> = new Proxy(
  {} as SupabaseClient<Database>,
  {
    get(_target, prop, _receiver) {
      const client = getClient();
      const value = Reflect.get(client, prop, client);
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
