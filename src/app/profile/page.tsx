
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/admin/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.push('/admin/login');
        } catch (error) {
            toast({ variant: "destructive", title: "Logout Failed", description: "There was an error logging you out." });
        }
    };
    
    const getUsername = (email: string | null | undefined) => {
      if (!email) return "User";
      return email.split('@')[0];
    }

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!user) {
        return null; // The useEffect hook will handle redirection.
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={user.displayName || 'User'} />
                                <AvatarFallback className="text-4xl">{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-3xl font-headline font-bold">{getUsername(user.email)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground">{user.email}</p>
                        <Button onClick={handleLogout} variant="destructive" className="mt-8 w-full">
                            <LogOut className="mr-2 h-4 w-4" />
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
