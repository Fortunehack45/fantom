
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Space_Grotesk as SpaceGrotesk } from 'next/font/google';
import { useEffect } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'], variable: '--font-space-grotesk', weight: ['400', '700'] });

const metadata: Metadata = {
  title: 'Fantom eSport',
  description: 'Welcome to the official website of Fantom eSport',
  icons: {
    icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22black%22><path d=%22M12 0L2.363 5.432v13.136L12 24l9.637-5.432V5.432zM11.636 22.25v-8.84H2.727v-1.782l8.91-5.045v15.667zm.728 0V6.583l8.91 5.045v1.782h-8.91z%22 /></svg>`,
  },
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
           <link rel="icon" href={metadata.icons.icon as string} type="image/svg+xml" />
           <link rel="preconnect" href="https://fonts.googleapis.com" />
           <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
           <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-body antialiased`}>
        <div id="cursor-glow"></div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
