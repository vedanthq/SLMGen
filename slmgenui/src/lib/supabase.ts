/**
 * Supabase Client Configuration.
 * 
 * Browser and server-side Supabase client factories.
 * 
 * When running locally without Supabase (AUTH_DISABLED=true on backend),
 * these functions gracefully handle missing env vars - createClient returns null
 * and isSupabaseConfigured() returns false. The auth context handles this and
 * treats the user as anonymous.
 * 
 * Contributor: Vedant Singh Rajput <teleported0722@gmail.com>
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import { createBrowserClient } from '@supabase/ssr'

/**
 * Check if Supabase is configured in the environment.
 * 
 * Use this to conditionally render auth-related UI or skip auth operations.
 * 
 * @returns true if NEXT_PUBLIC_SUPABASE_URL is set
 */
export function isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

/**
 * Create a Supabase client for browser/client-side usage.
 * 
 * Returns null if Supabase isn't configured - this lets you run the frontend
 * locally without setting up Supabase. The auth-context handles this case
 * and will treat the user as unauthenticated.
 * 
 * @returns Supabase client or null if not configured
 */
export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // Don't throw - let the auth context handle this gracefully
        // This allows running the frontend without Supabase for local dev
        console.warn('Supabase not configured - auth features will be disabled')
        return null
    }

    return createBrowserClient(url, key)
}

/**
 * Get Supabase URL (for direct API calls if needed).
 * Returns empty string if not configured.
 */
export function getSupabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}
