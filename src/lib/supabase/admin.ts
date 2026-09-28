/**
 * Server-side only Supabase admin client (service-role key).
 * NEVER import this in client components or expose it to the browser.
 * Use only in Server Actions / Route Handlers after verifying auth.
 */
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables for admin client.");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
