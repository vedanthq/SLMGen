/**
 * Main Navigation Bar Component.
 * 
 * Desktop and mobile responsive navigation with icons.
 * Everblush themed.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Github,
    Menu,
    X,
    Sparkles,
    Box,
    Zap,
    Info,
    Home,
} from '@/components/icons';

import Image from 'next/image';

interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    isExternal?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Features', href: '/#features', icon: Sparkles },
    { label: 'Models', href: '/#models', icon: Box },
    { label: 'How It Works', href: '/#how-it-works', icon: Zap },
    { label: 'About', href: '/about', icon: Info },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        if (href.startsWith('/#')) return pathname === '/';
        return pathname.startsWith(href);
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'pt-4 pb-2' : 'py-0'
                }`}
        >
            <div className="container mx-auto px-4">
                <motion.nav
                    layout
                    className={`
                        flex items-center justify-between transition-all duration-300
                        ${isScrolled
                            ? 'h-16 bg-[#141b1e]/70 backdrop-blur-xl border border-[#2d3437]/50 rounded-2xl shadow-xl shadow-black/20 px-6 max-w-5xl mx-auto'
                            : 'h-20 bg-transparent border-b border-[#2d3437] px-0 max-w-none'
                        }
                    `}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group mr-8">
                        <motion.div
                            className="relative w-9 h-9"
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5, ease: "circOut" }}
                        >
                            <Image
                                src="/logo.svg"
                                alt="SLMGEN Logo"
                                fill
                                className="object-contain"
                            />
                        </motion.div>
                        <span className="text-xl font-bold text-[#dadada] tracking-wide group-hover:text-white transition-colors">SLMGEN</span>
                    </Link>

                    {/* Desktop Navigation - Centered Pill Design */}
                    <div className="hidden md:flex items-center gap-1.5">
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="relative px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    {active && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-[#1e2528] rounded-xl border border-[#2d3437]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-10 flex items-center gap-2 ${active ? 'text-[#8ccf7e]' : 'text-[#8a9899] hover:text-[#dadada]'}`}>
                                        <item.icon className={`w-4 h-4 ${active ? 'text-[#8ccf7e]' : 'text-[#8a9899]'}`} />
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 md:ml-auto">
                        <a
                            href="https://github.com/eshanized/slmgen"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-[#8a9899] hover:text-[#dadada] hover:bg-[#1e2528]/50 border border-transparent hover:border-[#2d3437] rounded-xl transition-all text-sm font-medium"
                        >
                            <Github className="w-4 h-4" />
                            <span>GitHub</span>
                        </a>

                        <div className={`w-px h-8 bg-[#2d3437] hidden md:block mx-1 ${isScrolled ? 'h-6' : 'h-8'}`} />

                        <Link
                            href="/dashboard"
                            className="px-5 py-2.5 bg-gradient-to-r from-[#8ccf7e] to-[#6cbfbf] text-[#141b1e] rounded-xl font-bold hover:shadow-lg hover:shadow-[#8ccf7e]/20 transition-all hover:-translate-y-0.5 text-sm active:scale-95"
                        >
                            Get Started
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 text-[#8a9899] hover:text-[#dadada] hover:bg-[#1e2528] rounded-xl transition-colors"
                            aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        >
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.nav>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="md:hidden overflow-hidden"
                        >
                            <div className="mt-2 bg-[#1e2528]/95 backdrop-blur-xl rounded-2xl p-2 border border-[#2d3437] shadow-xl">
                                <div className="flex flex-col gap-1">
                                    {NAV_ITEMS.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`
                                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                                ${isActive(item.href)
                                                    ? 'bg-[#2d3437] text-[#8ccf7e]'
                                                    : 'text-[#8a9899] hover:text-[#dadada] hover:bg-[#232a2d]'
                                                }
                                            `}
                                        >
                                            <item.icon className="w-5 h-5" />
                                            {item.label}
                                        </Link>
                                    ))}
                                    <hr className="border-[#2d3437] my-2" />
                                    <a
                                        href="https://github.com/eshanized/slmgen"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#8a9899] hover:text-[#dadada] hover:bg-[#232a2d] transition-all"
                                    >
                                        <Github className="w-5 h-5" />
                                        GitHub
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}
