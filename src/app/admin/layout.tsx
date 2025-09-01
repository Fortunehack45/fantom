
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated
        if (pathname === '/admin/login' || pathname === '/signup') {
          router.push('/admin');
        }
      } else {
        // User is not authenticated
        if (pathname !== '/admin/login' && pathname !== '/signup') {
          router.push('/admin/login');
        }
      }
    }
  }, [user, loading, pathname, router]);


  if (loading) {
     return (
        <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
            <p>Loading...</p>
        </div>
    );
  }
  
  // Allow access to login and signup pages if not authenticated
  if (!user && (pathname === '/admin/login' || pathname === '/signup')) {
      return <>{children}</>;
  }

  // If user is authenticated, show the content
  if (user) {
    return <>{children}</>;
  }

  // Fallback for edge cases, though the useEffect should handle routing.
  return null;
}
