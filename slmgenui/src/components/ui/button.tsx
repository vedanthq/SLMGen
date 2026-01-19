/**
 * Button Component.
 * 
 * Reusable button with Everblush theming.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    variant = 'primary',
    size = 'md',
    children,
    icon,
    iconPosition = 'right',
    isLoading = false,
    className = '',
    disabled,
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-ring';

    const variants = {
        primary: 'bg-gradient-to-r from-[#8ccf7e] to-[#6cbfbf] text-[#141b1e] hover:shadow-lg hover:shadow-[#8ccf7e]/30 hover:-translate-y-0.5',
        secondary: 'bg-[#1e2528] border border-[#2d3437] text-[#dadada] hover:border-[#8ccf7e] hover:bg-[#232a2d]',
        ghost: 'text-[#8a9899] hover:text-[#dadada] hover:bg-[#1e2528]',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-3',
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                <>
                    {icon && iconPosition === 'left' && icon}
                    {children}
                    {icon && iconPosition === 'right' && icon}
                </>
            )}
        </button>
    );
});

Button.displayName = 'Button';
