
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Unica_One } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const unicaOne = Unica_One({ subsets: ['latin'], variable: '--font-unica-one', weight: ['400'] });

const metadata: Metadata = {
  title: 'Fantom eSport',
  description: 'Welcome to the official website of Fantom eSport',
  icons: null,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const cursorGlow = document.getElementById('cursor-glow');
    if (!cursorGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorGlow.style.opacity = '1';
      cursorGlow.style.left = `${e.clientX}px`;
      cursorGlow.style.top = `${e.clientY}px`;
    };

    const handleMouseLeave = () => {
      cursorGlow.style.opacity = '0';
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
          <title>{metadata.title as React.ReactNode}</title>
          <meta name="description" content={metadata.description!} />
      </head>
      <body className={`${inter.variable} ${unicaOne.variable} font-body antialiased`}>
        <div id="cursor-glow"></div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
