import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Fantom eSport',
  description: 'Welcome to the official website of Fantom eSport',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Teko:wght@400;500;700&family=Roboto:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
