
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, signOut, updateProfile } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Edit, Check, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfile {
    uid: string;
    email: string;
    username: string;
    photoURL: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchUserProfile = async (currentUser: User) => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data() as UserProfile);
        } else {
            // Create a default profile if it doesn't exist
            const defaultProfile = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                username: currentUser.email?.split('@')[0] || `user_${currentUser.uid.substring(0, 5)}`,
                photoURL: currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`,
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserProfile(currentUser);
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

    const handleUsernameEditToggle = () => {
        if (userProfile) {
            setNewUsername(userProfile.username);
            setIsEditingUsername(!isEditingUsername);
        }
    };

    const handleUsernameChange = async () => {
        if (!user || !userProfile || !newUsername.trim()) return;
        if (newUsername.length < 3 || newUsername.length > 15) {
            toast({ variant: 'destructive', title: 'Invalid Username', description: 'Username must be between 3 and 15 characters.' });
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
            toast({ variant: 'destructive', title: 'Invalid Username', description: 'Username can only contain letters, numbers, and underscores.' });
            return;
        }

        setIsSaving(true);
        const newUsernameLower = newUsername.toLowerCase();
        const oldUsernameLower = userProfile.username.toLowerCase();

        // If username hasn't changed (case-insensitive), do nothing
        if (newUsernameLower === oldUsernameLower) {
            setIsEditingUsername(false);
            setIsSaving(false);
            return;
        }

        const newUsernameRef = doc(db, 'usernames', newUsernameLower);
        const newUsernameSnap = await getDoc(newUsernameRef);

        if (newUsernameSnap.exists()) {
            toast({ variant: 'destructive', title: 'Username Taken', description: 'This username is already in use. Please choose another.' });
            setIsSaving(false);
            return;
        }

        try {
            const batch = writeBatch(db);
            const userDocRef = doc(db, 'users', user.uid);
            const oldUsernameRef = doc(db, 'usernames', oldUsernameLower);

            batch.update(userDocRef, { username: newUsername });
            batch.set(newUsernameRef, { uid: user.uid });
            batch.delete(oldUsernameRef);

            await batch.commit();

            await updateProfile(user, { displayName: newUsername });

            setUserProfile(prev => prev ? { ...prev, username: newUsername } : null);
            toast({ title: 'Success', description: 'Your username has been updated.' });
            setIsEditingUsername(false);
        } catch (error) {
            console.error("Error updating username: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update username.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !user) return;

        const file = event.target.files[0];
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            toast({ variant: 'destructive', title: 'File Too Large', description: 'Profile picture must be less than 2MB.' });
            return;
        }

        setIsUploading(true);
        const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);

        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await updateProfile(user, { photoURL: downloadURL });

            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { photoURL: downloadURL }, { merge: true });
            
            setUserProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null);
            
            toast({ title: 'Success', description: 'Profile picture updated!' });
        } catch (error) {
            console.error("Error uploading file: ", error);
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload your new profile picture.' });
        } finally {
            setIsUploading(false);
        }
    };


    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                             <div className="flex justify-center mb-4">
                                <Skeleton className="h-24 w-24 rounded-full" />
                             </div>
                             <Skeleton className="h-8 w-40 mx-auto" />
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                           <Skeleton className="h-5 w-48 mx-auto" />
                           <Skeleton className="h-10 w-full mt-8" />
                        </CardContent>
                    </Card>
                 </main>
                <Footer />
            </div>
        );
    }

    if (!user || !userProfile) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                         <div className="relative mx-auto w-fit">
                            <Avatar className="h-24 w-24 border-4 border-primary cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAvatarClick}>
                                <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                                <AvatarFallback className="text-4xl">{userProfile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 border-2 border-background">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : <Edit className="h-4 w-4 text-primary-foreground" />}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/gif"
                            />
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-4">
                             {isEditingUsername ? (
                                <div className="flex items-center gap-2">
                                     <Input
                                        id="username"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="h-9 text-center text-xl font-bold"
                                        maxLength={15}
                                     />
                                     <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleUsernameChange} disabled={isSaving}>
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                     </Button>
                                     <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={handleUsernameEditToggle} disabled={isSaving}>
                                        <X className="h-4 w-4" />
                                     </Button>
                                </div>
                             ) : (
                                <>
                                    <CardTitle className="text-3xl font-headline font-bold">{userProfile.username}</CardTitle>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleUsernameEditToggle}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </>
                             )}
                        </div>
                        <CardDescription>{userProfile.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
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
