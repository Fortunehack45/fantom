
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, onSnapshot, writeBatch, setDoc, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Crown, CheckCheck, UserPlus, UserCheck, MessageSquare, Newspaper, Video, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { format } from 'date-fns';
import { VideoPlayer } from '@/components/video-player';


interface UserProfile {
    uid: string;
    email: string;
    username: string;
    lowercaseUsername: string;
    photoURL: string;
    role: 'Creator' | 'Clan Owner' | 'User';
    verification: 'None' | 'Blue' | 'Gold';
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  imageUrl?: string;
  date: any;
  hint: string;
}

interface Short {
    id: string;
    title: string;
    videoUrl: string;
}

export default function UserProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [shorts, setShorts] = useState<Short[]>([]);
    const [totalLikes, setTotalLikes] = useState(0);
    const [contentLoading, setContentLoading] = useState(true);

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
        // Perform a case-insensitive query
        const q = query(usersRef, where('lowercaseUsername', '==', username.toLowerCase()));

        const fetchProfile = async () => {
            try {
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setProfile(null);
                } else {
                    const userDoc = querySnapshot.docs[0];
                    const userData = userDoc.data() as UserProfile;
                    setProfile(userData);
                    fetchUserContent(userData.uid);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch user profile.' });
            } finally {
                setLoading(false);
            }
        };

        const fetchUserContent = async (userId: string) => {
            setContentLoading(true);
            try {
                const postsQuery = query(collection(db, 'blogPosts'), where('authorId', '==', userId), orderBy('date', 'desc'));
                const shortsQuery = query(collection(db, 'shorts'), where('authorId', '==', userId), orderBy('timestamp', 'desc'));

                const [postsSnapshot, shortsSnapshot] = await Promise.all([
                    getDocs(postsQuery),
                    getDocs(shortsQuery)
                ]);

                const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
                const shortsData = shortsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Short));
                
                const postLikes = postsSnapshot.docs.reduce((acc, doc) => acc + (doc.data().likes?.length || 0), 0);
                const shortLikes = shortsSnapshot.docs.reduce((acc, doc) => acc + (doc.data().likes?.length || 0), 0);

                setPosts(postsData);
                setShorts(shortsData);
                setTotalLikes(postLikes + shortLikes);

            } catch (error) {
                console.error("Error fetching user content:", error);
            } finally {
                setContentLoading(false);
            }
        }

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
                batch.delete(followingRef);
                batch.delete(followerRef);
                toast({ title: 'Unfollowed', description: `You are no longer following ${profile.username}.` });
            } else {
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
    
    const handleStartChat = async () => {
        if (!currentUser || !profile || currentUser.uid === profile.uid) return;

        const chatId = [currentUser.uid, profile.uid].sort().join('_');
        const chatDocRef = doc(db, 'chats', chatId);

        try {
            const chatDoc = await getDoc(chatDocRef);
            if (!chatDoc.exists()) {
                await setDoc(chatDocRef, {
                    users: [currentUser.uid, profile.uid],
                    userNames: {
                        [currentUser.uid]: currentUser.displayName,
                        [profile.uid]: profile.username,
                    },
                    userAvatars: {
                        [currentUser.uid]: currentUser.photoURL,
                        [profile.uid]: profile.photoURL,
                    },
                    lastMessageTimestamp: serverTimestamp(),
                });
            }
            router.push(`/messages/${chatId}`);
        } catch (error) {
            console.error('Error starting chat:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start conversation.' });
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

    const StatItem = ({ value, label }: { value: number, label: string }) => (
        <div className="text-center">
            <p className="font-bold text-lg">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );


    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
                <Card className="w-full max-w-4xl mx-auto overflow-visible">
                    <CardHeader className="p-0 relative h-32 md:h-48 rounded-t-lg bg-card-foreground" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.05))' }}>
                         <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Avatar className="h-28 w-28 md:h-36 md:w-36 border-4 border-background bg-background">
                                <AvatarImage src={profile.photoURL} alt={profile.username} />
                                <AvatarFallback className="text-5xl">{profile.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-20 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <CardTitle className="text-4xl font-headline font-bold">{profile.username}</CardTitle>
                            {profile.verification === 'Blue' && <CheckCheck className="h-7 w-7 text-blue-500" title="Verified Creator" />}
                            {profile.verification === 'Gold' && <Crown className="h-7 w-7 text-yellow-500" title="Verified Clan Owner" />}
                        </div>
                        <CardDescription>{profile.email}</CardDescription>
                         <div className="mt-2">
                           <Badge variant={profile.role === 'Clan Owner' ? 'primary' : 'secondary'}>{profile.role}</Badge>
                         </div>
                        
                        <div className="flex justify-center gap-6 text-sm my-6">
                            <StatItem value={posts.length + shorts.length} label="Posts" />
                            <StatItem value={followersCount} label="Followers" />
                            <StatItem value={followingCount} label="Following" />
                            <StatItem value={totalLikes} label="Likes" />
                        </div>

                        {currentUser && !isOwnProfile && (
                            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                                <Button onClick={handleFollowToggle} disabled={isFollowLoading} variant={isFollowing ? 'outline' : 'primary'} className="flex-1">
                                    {isFollowLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
                                    isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Button>
                                 <Button variant="secondary" onClick={handleStartChat} className="flex-1">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </div>
                        )}

                        {isOwnProfile && (
                             <Link href="/profile">
                                <Button variant="outline">Edit Your Profile</Button>
                             </Link>
                        )}
                    </CardContent>
                </Card>

                <Tabs defaultValue="blog-posts" className="max-w-4xl mx-auto mt-12">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="blog-posts"><Newspaper className="mr-2 h-4 w-4" />Blog Posts</TabsTrigger>
                        <TabsTrigger value="shorts"><Video className="mr-2 h-4 w-4" />Shorts</TabsTrigger>
                    </TabsList>
                    <TabsContent value="blog-posts" className="mt-6">
                        {contentLoading ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64" />)}
                             </div>
                        ) : posts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">This user has not posted any articles yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.map(post => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                                         <Card className="bg-card border-border overflow-hidden group h-full flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                                            <div className="relative aspect-video">
                                                <Image
                                                    src={post.imageUrl || `https://picsum.photos/400/250?random=${post.id}`}
                                                    alt={post.title}
                                                    fill
                                                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                    data-ai-hint={post.hint}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <Badge variant="primary" className="absolute top-2 left-2">{post.category}</Badge>
                                            </div>
                                            <CardContent className="p-4 flex-grow flex flex-col">
                                                <h3 className="text-md font-headline font-bold uppercase leading-tight mt-1 group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground uppercase mt-2">
                                                   {post.date ? format(new Date(post.date.seconds ? post.date.seconds * 1000 : post.date), 'MMM d, yyyy') : ''}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="shorts" className="mt-6">
                         {contentLoading ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => <Skeleton key={i} className="aspect-[9/16] h-96" />)}
                             </div>
                        ) : shorts.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">This user has not posted any shorts yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                {shorts.map(short => (
                                    <Link key={short.id} href={`/shorts#${short.id}`}>
                                        <Card className="w-full bg-card shadow-lg border-primary/20 overflow-hidden relative group">
                                            <VideoPlayer url={short.videoUrl} />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                                <h3 className="font-semibold text-white truncate group-hover:text-primary transition-colors">{short.title}</h3>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
}
