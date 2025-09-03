
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, onSnapshot, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Crown, CheckCheck, UserPlus, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface UserProfile {
    uid: string;
    email: string;
    username: string;
    photoURL: string;
    role: 'Creator' | 'Clan Owner' | 'User';
    verification: 'None' | 'Blue' | 'Gold';
}

export default function UserProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const username = params?.username as string;

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!username) return;
        setLoading(true);

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));

        const fetchProfile = async () => {
            try {
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    console.log('No such user!');
                    setProfile(null);
                } else {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data() as UserProfile;
                    setProfile(userData);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch user profile.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username, toast]);

    useEffect(() => {
        if (!profile || !currentUser) {
            setIsFollowing(false);
            return;
        };

        const followerRef = doc(db, 'users', profile.uid, 'followers', currentUser.uid);
        const unsubscribeFollower = onSnapshot(followerRef, (doc) => {
            setIsFollowing(doc.exists());
        });

        const followersColRef = collection(db, 'users', profile.uid, 'followers');
        const unsubscribeFollowersCount = onSnapshot(followersColRef, (snapshot) => {
            setFollowersCount(snapshot.size);
        });

        const followingColRef = collection(db, 'users', profile.uid, 'following');
        const unsubscribeFollowingCount = onSnapshot(followingColRef, (snapshot) => {
            setFollowingCount(snapshot.size);
        });

        return () => {
            unsubscribeFollower();
            unsubscribeFollowersCount();
            unsubscribeFollowingCount();
        }
    }, [profile, currentUser]);

    const handleFollowToggle = async () => {
        if (!currentUser || !profile || isFollowLoading) return;
        
        setIsFollowLoading(true);

        const followingRef = doc(db, 'users', currentUser.uid, 'following', profile.uid);
        const followerRef = doc(db, 'users', profile.uid, 'followers', currentUser.uid);
        
        const batch = writeBatch(db);

        try {
            if (isFollowing) {
                // Unfollow
                batch.delete(followingRef);
                batch.delete(followerRef);
                toast({ title: 'Unfollowed', description: `You are no longer following ${profile.username}.` });
            } else {
                // Follow
                batch.set(followingRef, { username: profile.username, photoURL: profile.photoURL, timestamp: new Date() });
                batch.set(followerRef, { username: currentUser.displayName, photoURL: currentUser.photoURL, timestamp: new Date() });
                toast({ title: 'Followed', description: `You are now following ${profile.username}.` });
            }
            await batch.commit();
        } catch (error) {
            console.error("Error toggling follow:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the action.' });
        } finally {
            setIsFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center items-center">
                             <Skeleton className="h-24 w-24 rounded-full" />
                             <Skeleton className="h-8 w-40 mt-4" />
                             <Skeleton className="h-5 w-48" />
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                           <Skeleton className="h-5 w-full" />
                           <Skeleton className="h-10 w-32 mx-auto mt-4" />
                        </CardContent>
                    </Card>
                 </main>
                <Footer />
            </div>
        );
    }
    
    if (!profile) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <div className="flex-grow flex flex-col justify-center items-center">
                    <p className="text-2xl font-headline">User Not Found</p>
                    <p className="text-muted-foreground">The profile you are looking for does not exist.</p>
                     <Link href="/">
                        <Button variant="ghost" className="mt-4">
                            Go Home
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }
    
    const isOwnProfile = currentUser?.uid === profile.uid;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader className="text-center items-center">
                        <Avatar className="h-28 w-28 border-4 border-primary">
                            <AvatarImage src={profile.photoURL} alt={profile.username} />
                            <AvatarFallback className="text-5xl">{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2 mt-4">
                            <CardTitle className="text-4xl font-headline font-bold">{profile.username}</CardTitle>
                            {profile.verification === 'Blue' && <CheckCheck className="h-7 w-7 text-blue-500" title="Verified Creator" />}
                            {profile.verification === 'Gold' && <Crown className="h-7 w-7 text-yellow-500" title="Verified Clan Owner" />}
                        </div>
                        <CardDescription>{profile.email}</CardDescription>
                         <div className="mt-2">
                           <Badge variant={profile.role === 'Clan Owner' ? 'primary' : 'secondary'}>{profile.role}</Badge>
                         </div>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="flex justify-center gap-6 text-sm">
                            <div className="text-center">
                                <p className="font-bold text-lg">{followersCount}</p>
                                <p className="text-muted-foreground">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">{followingCount}</p>
                                <p className="text-muted-foreground">Following</p>
                            </div>
                        </div>

                        {currentUser && !isOwnProfile && (
                            <Button onClick={handleFollowToggle} disabled={isFollowLoading} variant={isFollowing ? 'outline' : 'primary'} className="w-full">
                                {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                                 isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {isFollowing ? 'Following' : 'Follow'}
                            </Button>
                        )}

                        {isOwnProfile && (
                             <Link href="/profile">
                                <Button variant="outline" className="w-full">Edit Your Profile</Button>
                             </Link>
                        )}
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}

    