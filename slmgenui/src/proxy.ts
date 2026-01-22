/**
 * Next.js Proxy for Route Protection.
 * 
 * Handles auth redirects and session refresh.
 * Renamed from middleware.ts to proxy.ts for Next.js 16+.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
]

// Routes only for unauthenticated users
const AUTH_ROUTES = [
    '/login',
    '/signup',
]

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request,
    })

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If running in local dev mode without Supabase, bypass all auth checks
    if (!supabaseUrl || !supabaseKey) {
        // console.warn('Supabase not configured in middleware - bypassing auth')
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if exists
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // Check if accessing protected route without auth
    const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (isProtectedRoute && !user) {
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Check if accessing auth route while authenticated
    const isAuthRoute = AUTH_ROUTES.some(route =>
        pathname.startsWith(route)
    )

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes (let them handle their own auth)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
