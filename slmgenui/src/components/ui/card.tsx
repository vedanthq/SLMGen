/**
 * Card Component.
 * 
 * Glass-morphism card with Everblush theming.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client';

import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    variant?: 'default' | 'glass' | 'glow';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
    children,
    variant = 'default',
    hover = false,
    padding = 'md',
    className = '',
    ...props
}: CardProps) {
    const baseStyles = 'rounded-xl transition-all duration-300';

    const variants = {
        default: 'bg-[#1e2528] border border-[#2d3437]',
        glass: 'bg-[#1e2528]/80 backdrop-blur-xl border border-[#2d3437]',
        glow: 'bg-[#1e2528] border border-[#2d3437] shadow-lg shadow-[#8ccf7e]/10',
    };

    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
    };

    const hoverStyles = hover ? 'hover:-translate-y-1 hover:shadow-xl hover:border-[#8ccf7e]/50 cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    );
}

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode;
    icon?: ReactNode;
}

export function CardTitle({ children, icon, className = '', ...props }: CardTitleProps) {
    return (
        <h3 className={`flex items-center gap-2 text-lg font-semibold text-[#dadada] ${className}`} {...props}>
            {icon && <span className="text-[#8ccf7e]">{icon}</span>}
            {children}
        </h3>
    );
}

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
    return (
        <div className={className} {...props}>
            {children}
        </div>
    );
}
