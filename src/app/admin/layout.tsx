
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

    const isProtectedAdminPage = pathname === '/admin';
    const isLoginPage = pathname === '/admin/login';
    
    if (isAuthorized) {
      // Authorized admin is logged in
      if (isLoginPage) {
        router.push('/admin');
      }
    } else {
      // User is not the authorized admin (could be another logged in user, or logged out)
      if (isProtectedAdminPage) {
        // If a non-admin tries to access the main admin page, send them to login.
        // This also handles the case where the admin logs out and should be sent to the login page.
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
  
  // The login and signup pages are accessible to everyone, so we always render them.
  if (pathname === '/admin/login' || pathname === '/signup') {
    return <>{children}</>
  }
  
  // If the user is the authorized admin, show them the protected admin content.
  if(isAuthorized && pathname.startsWith('/admin')) {
      return <>{children}</>;
  }

  // If the user is not authorized and trying to access a protected admin page, 
  // the useEffect above is already handling the redirect. We return null to avoid rendering anything.
  if (!isAuthorized && pathname.startsWith('/admin')) {
      return null;
  }
  
  // For any other case (which should be rare), we don't want to interfere with rendering.
  return <>{children}</>;
}
