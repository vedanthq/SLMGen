/**
 * Theme Toggle Component.
 * 
 * Sun/Moon toggle button for switching themes.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client'

import { useTheme } from '@/contexts/theme-context'

// Inline SVG icons to avoid import issues
function SunIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
    )
}

function MoonIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    )
}

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#1e2528] border border-[#2d3437] text-[#dadada] hover:border-[#8ccf7e]/50 transition-colors"
            aria-label="Toggle theme"
        >
            {resolvedTheme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
            ) : (
                <MoonIcon className="w-5 h-5" />
            )}
        </button>
    )
}
