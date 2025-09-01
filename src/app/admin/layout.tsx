
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const ADMIN_EMAIL = 'fortunedomination@gmail.com';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthorized(currentUser?.email === ADMIN_EMAIL);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (isAuthorized) {
      // Authorized admin is logged in
      if (pathname === '/admin/login' || pathname === '/signup') {
        router.push('/admin');
      }
    } else {
      // User is not the authorized admin (or is not logged in)
      if (pathname !== '/admin/login' && pathname !== '/signup') {
        router.push('/admin/login');
      }
    }
  }, [user, isAuthorized, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If authorized, show the admin content.
  if (isAuthorized) {
    return <>{children}</>;
  }

  // If not authorized, only show login/signup pages.
  // This allows the correct admin to log in.
  if (!isAuthorized && (pathname === '/admin/login' || pathname === '/signup')) {
    return <>{children}</>;
  }

  // In all other unauthorized cases, we are redirecting, so nothing needs to be rendered.
  // A null return is appropriate as the redirect in useEffect will handle navigation.
  return null;
}
