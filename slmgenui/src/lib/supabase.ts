/**
 * Supabase Client Configuration.
 * 
 * Browser and server-side Supabase client factories.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for browser/client-side usage.
 */
export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('Supabase URL and anon key must be configured in environment variables')
    }

    return createBrowserClient(url, key)
}

/**
 * Get Supabase URL (for direct API calls if needed).
 */
export function getSupabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL!
}
