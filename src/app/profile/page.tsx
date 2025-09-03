
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Edit, Check, X, Loader2, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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
    const [newPhotoURL, setNewPhotoURL] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUrlModalOpen, setIsPhotoUrlModalOpen] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();

    const fetchUserProfile = async (currentUser: User) => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setUserProfile(profileData);
            setNewPhotoURL(profileData.photoURL);
        } else {
            const defaultProfile = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                username: currentUser.displayName || currentUser.email?.split('@')[0] || `user_${currentUser.uid.substring(0, 5)}`,
                photoURL: currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`,
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
            setNewPhotoURL(defaultProfile.photoURL);
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
    
    const handlePhotoEdit = () => {
        setNewPhotoURL(userProfile?.photoURL || '');
        setIsPhotoUrlModalOpen(true);
    }

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
    
    const handlePhotoURLChange = async () => {
        if (!user || !userProfile || !newPhotoURL.trim()) {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid image URL.' });
            return;
        }
        
        try {
            // Basic URL validation
            new URL(newPhotoURL);
        } catch (_) {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'The provided URL is not valid. Please check and try again.' });
            return;
        }
        
        setIsSaving(true);
        try {
            await updateProfile(user, { photoURL: newPhotoURL });
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, { photoURL: newPhotoURL }, { merge: true });
            
            setUserProfile(prev => prev ? { ...prev, photoURL: newPhotoURL } : null);
            toast({ title: 'Success', description: 'Profile picture updated!' });
            setIsPhotoUrlModalOpen(false);
        } catch (error) {
            console.error("Error updating photo URL: ", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your profile picture.' });
        } finally {
            setIsSaving(false);
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
                <Dialog open={isPhotoUrlModalOpen} onOpenChange={setIsPhotoUrlModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                      <DialogDescription>
                        Paste a direct link to an image to set it as your new profile picture.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="photo-url">Image URL</Label>
                        <Input 
                            id="photo-url"
                            value={newPhotoURL}
                            onChange={(e) => setNewPhotoURL(e.target.value)}
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsPhotoUrlModalOpen(false)}>Cancel</Button>
                      <Button onClick={handlePhotoURLChange} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                         <div className="relative mx-auto w-fit group">
                            <Avatar className="h-24 w-24 border-4 border-primary">
                                <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                                <AvatarFallback className="text-4xl">{userProfile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <button
                                onClick={handlePhotoEdit}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Edit className="h-8 w-8" />
                            </button>
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
