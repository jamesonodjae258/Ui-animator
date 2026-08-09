import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getValidSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.startsWith("your-") || !url.startsWith("http")) {
    return "https://placeholder.supabase.co";
  }
  return url;
}

function getValidSupabaseKey(keyName: "NEXT_PUBLIC_SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const key = process.env[keyName];
  if (!key || key.startsWith("your-")) {
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";
  }
  return key;
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getValidSupabaseUrl(),
    getValidSupabaseKey("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}

/**
 * Service-role client for admin operations (storage, bypassing RLS, etc.).
 * Only use server-side — never expose the service role key to the client.
 */
export function createServiceClient() {
  return createSupabaseClient(
    getValidSupabaseUrl(),
    getValidSupabaseKey("SUPABASE_SERVICE_ROLE_KEY"),
  );
}
