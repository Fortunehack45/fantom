
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Inter, Unica_One } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const unicaOne = Unica_One({ subsets: ['latin'], variable: '--font-unica-one', weight: ['400'] });

export const metadata: Metadata = {
  title: 'Fantom eSport',
  description: 'Welcome to the official website of Fantom eSport',
  icons: null,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${unicaOne.variable} font-body antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
