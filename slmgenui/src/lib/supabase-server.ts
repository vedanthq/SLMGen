/**
 * Supabase Server Client.
 * 
 * Server-side Supabase client for Next.js server components and actions.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from './database.types'

/**
 * Create a Supabase client for server-side usage.
 * 
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createServerSupabaseClient() {
    const cookieStore = await cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore in Server Components (read-only)
                    }
                },
            },
        }
    )
}

/**
 * Get current user from server context.
 */
export async function getServerUser() {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Get current session from server context.
 */
export async function getServerSession() {
    const supabase = await createServerSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
}
