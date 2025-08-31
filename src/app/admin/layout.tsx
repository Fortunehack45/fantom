'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const authStatus = sessionStorage.getItem('isAuthenticated');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
        if (pathname === '/admin/login') {
            router.push('/admin');
        }
      } else if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    } catch (error) {
        // sessionStorage is not available on the server
        if (pathname !== '/admin/login') {
            router.push('/admin/login');
        }
    }
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
            <p>Loading...</p>
        </div>
    );
  }

  return <>{children}</>;
}
