
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, writeBatch, updateDoc, serverTimestamp, query, where, collection, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, Edit, Check, X, Loader2, Award, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Image from 'next/image';
import { VerificationBadge } from '@/components/icons/verification-badge';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
    uid: string;
    email: string;
    username: string;
    photoURL: string;
    bannerURL?: string;
    role: 'Creator' | 'Clan Owner' | 'User';
    verification: 'None' | 'Blue' | 'Gold';
}

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isPhotoUrlModalOpen, setIsPhotoUrlModalOpen] = useState(false);
    const [photoUrlToEdit, setPhotoUrlToEdit] = useState('');
    const [photoType, setPhotoType] = useState<'profile' | 'banner' | null>(null);

    const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
    const [requestedVerification, setRequestedVerification] = useState<'Blue' | 'Gold' | null>(null);
    const [hasPendingRequest, setHasPendingRequest] = useState(false);
    
    const router = useRouter();
    const { toast } = useToast();

    // Go to /profile/`username` when this page is loaded
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if(userDocSnap.exists()) {
                    const username = userDocSnap.data().username;
                    if(username && router) {
                         // Check if we are already on the correct profile page
                        if(!window.location.pathname.endsWith(username)) {
                           router.replace(`/profile/${username}`);
                        } else {
                           // If we are on the right page, proceed to load data
                           setUser(currentUser);
                           await fetchUserProfile(currentUser);
                           setLoading(false);
                        }
                    } else {
                        // User doc exists but no username, stay on this page to edit
                        setUser(currentUser);
                        await fetchUserProfile(currentUser);
                        setLoading(false);
                    }
                } else {
                    // This is a new user, create their profile and redirect
                    const defaultUsername = currentUser.displayName || currentUser.email?.split('@')[0] || `user_${currentUser.uid.substring(0, 5)}`;
                    const defaultProfile: UserProfile = {
                        uid: currentUser.uid,
                        email: currentUser.email || '',
                        username: defaultUsername,
                        photoURL: currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`,
                        role: 'User',
                        verification: 'None',
                    };
                    await setDoc(userDocRef, defaultProfile);
                    router.replace(`/profile/${defaultUsername}`);
                }
            } else {
                router.push('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router]);


    const checkPendingVerification = async (uid: string) => {
        const requestsRef = collection(db, 'verificationRequests');
        const q = query(requestsRef, where('userId', '==', uid), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);
        setHasPendingRequest(!querySnapshot.empty);
    };

    const fetchUserProfile = async (currentUser: User) => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profileData = userDocSnap.data() as UserProfile;
            setUserProfile(profileData);
        } else {
             const defaultUsername = currentUser.displayName || currentUser.email?.split('@')[0] || `user_${currentUser.uid.substring(0, 5)}`;
            const defaultProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email || '',
                username: defaultUsername,
                photoURL: currentUser.photoURL || `https://i.pravatar.cc/150?u=${currentUser.uid}`,
                role: 'User',
                verification: 'None',
            };
            await setDoc(userDocRef, defaultProfile);
            setUserProfile(defaultProfile);
        }
        await checkPendingVerification(currentUser.uid);
    };

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
    
    const handlePhotoEdit = (type: 'profile' | 'banner') => {
        if (!userProfile) return;
        setPhotoType(type);
        setPhotoUrlToEdit(type === 'profile' ? userProfile.photoURL : (userProfile.bannerURL || ''));
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

            batch.update(userDocRef, { username: newUsername, lowercaseUsername: newUsernameLower });
            batch.set(newUsernameRef, { uid: user.uid });
            batch.delete(oldUsernameRef);

            await batch.commit();

            await updateProfile(user, { displayName: newUsername });
            
            router.push(`/profile/${newUsername}`);
            
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
        if (!user || !userProfile || !photoUrlToEdit.trim() || !photoType) {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid Pinterest image URL.' });
            return;
        }
        
        try {
            const url = new URL(photoUrlToEdit);
            if (!url.hostname.includes('pinterest.com') && !url.hostname.includes('i.pinimg.com')) {
                 toast({ variant: 'destructive', title: 'Invalid URL', description: 'URL must be a direct link from Pinterest (i.pinimg.com) or pinterest.com.' });
                 return;
            }
        } catch (_) {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'The provided URL is not valid. Please check and try again.' });
            return;
        }
        
        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            if (photoType === 'profile') {
                await updateProfile(user, { photoURL: photoUrlToEdit });
                await updateDoc(userDocRef, { photoURL: photoUrlToEdit });
                setUserProfile(prev => prev ? { ...prev, photoURL: photoUrlToEdit } : null);
            } else {
                await updateDoc(userDocRef, { bannerURL: photoUrlToEdit });
                setUserProfile(prev => prev ? { ...prev, bannerURL: photoUrlToEdit } : null);
            }
            
            toast({ title: 'Success', description: `Your ${photoType} picture has been updated!` });
            setIsPhotoUrlModalOpen(false);
        } catch (error) {
            console.error("Error updating photo URL: ", error);
            toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your profile picture.' });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleVerificationRequest = async () => {
        if (!user || !userProfile || !requestedVerification) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a verification type.' });
            return;
        }
        setIsSaving(true);
        try {
            const requestRef = collection(db, 'verificationRequests');
            await addDoc(requestRef, {
                userId: user.uid,
                username: userProfile.username,
                requestedLevel: requestedVerification,
                status: 'pending',
                timestamp: serverTimestamp(),
            });
            toast({ title: 'Success', description: 'Your verification request has been submitted.' });
            setHasPendingRequest(true);
            setIsVerificationModalOpen(false);
        } catch (error) {
            console.error("Error submitting request: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit your request.' });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                     <Loader2 className="h-16 w-16 animate-spin text-primary" />
                 </main>
                <Footer />
            </div>
        );
    }

    if (!user || !userProfile) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                    <p>Redirecting...</p>
                    <Loader2 className="ml-2 h-8 w-8 animate-spin text-primary" />
                 </main>
                <Footer />
            </div>
        );
    }
    
    const isRoleSet = userProfile.role !== 'User';

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Dialog open={isPhotoUrlModalOpen} onOpenChange={setIsPhotoUrlModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update {photoType === 'profile' ? 'Profile' : 'Banner'} Picture</DialogTitle>
                      <DialogDescription>
                        Paste a direct link to a Pinterest image to set it as your new picture.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="photo-url">Pinterest Image URL</Label>
                        <Input 
                            id="photo-url"
                            value={photoUrlToEdit}
                            onChange={(e) => setPhotoUrlToEdit(e.target.value)}
                            placeholder="https://i.pinimg.com/..."
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

                <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Verification</DialogTitle>
                      <DialogDescription>
                        Select the type of verification you would like to request. This will be reviewed by an admin.
                      </DialogDescription>
                    </DialogHeader>
                    <RadioGroup value={requestedVerification || ''} onValueChange={(value: 'Blue' | 'Gold') => setRequestedVerification(value)} className="my-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Blue" id="blue" />
                        <Label htmlFor="blue" className="flex items-center gap-2">
                           <VerificationBadge className="text-[#1D9BF0] h-5 w-5" /> Blue Verification (Creator)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Gold" id="gold" />
                        <Label htmlFor="gold" className="flex items-center gap-2">
                            <VerificationBadge className="text-[#A47C1B] h-5 w-5" /> Gold Verification (Clan Owner)
                        </Label>
                      </div>
                    </RadioGroup>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setIsVerificationModalOpen(false)}>Cancel</Button>
                      <Button onClick={handleVerificationRequest} disabled={isSaving || !requestedVerification}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Card className="w-full max-w-2xl">
                    <CardHeader className="p-0 relative h-36 md:h-48 rounded-t-lg bg-card-foreground group">
                        <Image 
                            src={userProfile.bannerURL || 'https://i.pinimg.com/originals/a1/b4/27/a1b427a7c88b7f8973686942c4f68641.jpg'}
                            alt={`${userProfile.username}'s banner`}
                            fill
                            className="object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                         <Button variant="ghost" size="icon" onClick={() => handlePhotoEdit('banner')} className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-5 w-5"/>
                         </Button>
                         <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <div className="relative group">
                                <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background bg-background">
                                    <AvatarImage src={userProfile.photoURL} alt={userProfile.username} />
                                    <AvatarFallback className="text-5xl">{userProfile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                 <button
                                    onClick={() => handlePhotoEdit('profile')}
                                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Camera className="h-8 w-8" />
                                </button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-20 text-center">
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
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-3xl font-headline font-bold">{userProfile.username}</CardTitle>
                                        {userProfile.verification === 'Blue' && <VerificationBadge className="text-[#1D9BF0]" title="Verified Creator" />}
                                        {userProfile.verification === 'Gold' && <VerificationBadge className="text-[#A47C1B]" title="Verified Clan Owner" />}
                                        <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleUsernameEditToggle}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </>
                             )}
                        </div>
                        <CardDescription>{userProfile.email}</CardDescription>
                         <div className="mt-2">
                           <Badge variant={userProfile.role === 'Clan Owner' ? 'primary' : 'secondary'}>{userProfile.role}</Badge>
                         </div>
                    
                        <div className="mt-8 space-y-4">
                            {userProfile.verification === 'None' && isRoleSet && (
                                <Button 
                                    variant="outline"
                                    onClick={() => setIsVerificationModalOpen(true)}
                                    disabled={hasPendingRequest}
                                >
                                    <Award className="mr-2 h-4 w-4" />
                                    {hasPendingRequest ? 'Verification Pending' : 'Request Verification'}
                                </Button>
                            )}
                            
                            <Button onClick={handleLogout} variant="destructive" className="w-full max-w-xs mx-auto">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
