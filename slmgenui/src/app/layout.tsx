/**
 * Root Layout for SLMGEN.
 * 
 * Sets up fonts, auth, and base HTML structure.
 * 
 * @author Eshan Roy <eshanized@proton.me>
 * @license MIT
 * @copyright 2026 Eshan Roy
 */

import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import { AuthProvider } from '@/contexts/auth-context';
import './globals.css';

// Primary font for the whole website
const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SLMGEN - Fine-tune SLMs in Minutes',
  description: 'Generate ready-to-run Colab notebooks for fine-tuning Small Language Models. 2x faster with Unsloth, 70% less VRAM, completely free.',
  keywords: ['LLM', 'fine-tuning', 'machine learning', 'AI', 'Unsloth', 'LoRA'],
  authors: [{ name: 'Eshan Roy', url: 'https://github.com/eshanized' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${firaCode.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}



