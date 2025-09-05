
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
    icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 128 128%22><path d=%22M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm0 119.5C33.3 119.5 8.5 94.7 8.5 64S33.3 8.5 64 8.5s55.5 24.8 55.5 55.5S94.7 119.5 64 119.5z%22 fill=%22%23000%22/><path d=%22M94.3 33.7L55.4 92.3V33.7h-9.2v72.1h9.2L94.3 43.1v59.2h9.2V33.7z%22 fill=%22%23000%22/></svg>`,
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
