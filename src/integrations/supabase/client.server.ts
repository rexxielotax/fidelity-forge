// Server-side Supabase client.
// Uses the Supabase service-role key from the Vercel/server environment.
// NEVER import this file from client-side/browser code.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function isNewSupabaseApiKey(value: string): boolean {
  return (
    value.startsWith("sb_publishable_") ||
    value.startsWith("sb_secret_")
  );
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => {
        headers.set(key, value);
      });
    }

    // New Supabase API keys are opaque strings and should not
    // be sent as Bearer tokens.
    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);

    return fetch(input, {
      ...init,
      headers,
    });
  };
}

function createSupabaseAdminClient() {
const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!supabaseUrl || !serviceRoleKey) {
    const missing: string[] = [];

    if (!supabaseUrl) {
      missing.push("SUPABASE_URL");
    }

    if (!serviceRoleKey) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }

    const message =
      `Missing Supabase environment variable(s): ${missing.join(", ")}. ` +
      `Check your Vercel environment variables.`;

    console.error(`[Supabase Server] ${message}`);

    throw new Error(message);
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      global: {
        fetch: createSupabaseFetch(serviceRoleKey),
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

let supabaseAdminInstance:
  | ReturnType<typeof createSupabaseAdminClient>
  | undefined;

/**
 * Server-side Supabase admin client.
 *
 * IMPORTANT:
 * - Uses SUPABASE_SERVICE_ROLE_KEY.
 * - Bypasses Supabase RLS.
 * - Must only be used inside server functions/routes.
 * - Never expose this client to browser/client code.
 */
export const supabaseAdmin = new Proxy(
  {} as ReturnType<typeof createSupabaseAdminClient>,
  {
    get(_target, property, receiver) {
      if (!supabaseAdminInstance) {
        supabaseAdminInstance = createSupabaseAdminClient();
      }

      return Reflect.get(
        supabaseAdminInstance,
        property,
        receiver,
      );
    },
  },
);