
'use client';

import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, orderBy, query, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, serverTimestamp, addDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Header } from "@/components/header";
import { Footer } from '@/components/footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, Video, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from '@/components/video-player';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    content: string;
    timestamp: any;
}

interface Short {
    id: string;
    title: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    videoUrl: string;
    timestamp: any;
    likes: string[];
    shares: number;
    comments?: Comment[];
}

export default function ShortsPage() {
    const [shorts, setShorts] = useState<Short[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const { toast } = useToast();
    const [newComment, setNewComment] = useState('');
    const [commentingOn, setCommentingOn] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        const shortsRef = collection(db, "shorts");
        const q = query(shortsRef, orderBy("timestamp", "desc"));
        const unsubscribeShorts = onSnapshot(q, (querySnapshot) => {
            const shortsPromises = querySnapshot.docs.map(async (shortDoc) => {
                const shortData = { id: shortDoc.id, ...shortDoc.data() } as Short;
                
                const commentsRef = collection(db, 'shorts', shortDoc.id, 'comments');
                const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));
                const commentsSnapshot = await getDocs(commentsQuery);
                const commentsData = commentsSnapshot.docs.map(commentDoc => ({id: commentDoc.id, ...commentDoc.data() } as Comment));
                
                return { ...shortData, comments: commentsData };
            });
            Promise.all(shortsPromises).then(shortsData => {
                 setShorts(shortsData);
                 setLoading(false);
            });
        }, (error) => {
            console.error("Error fetching shorts: ", error);
            setLoading(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch video shorts.' });
        });

        return () => {
            unsubscribeAuth();
            unsubscribeShorts();
        };
    }, [toast]);
    
    const handleLikeShort = async (shortId: string) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like a short.' });
            return;
        }

        const shortRef = doc(db, 'shorts', shortId);
        const short = shorts.find(s => s.id === shortId);
        if (!short) return;
        
        try {
            if (short.likes.includes(user.uid)) {
                await updateDoc(shortRef, { likes: arrayRemove(user.uid) });
            } else {
                await updateDoc(shortRef, { likes: arrayUnion(user.uid) });
            }
        } catch(error) {
            console.error("Error liking short: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.'});
        }
    };
    
    const handleAddComment = async (shortId: string) => {
        if (!user || !newComment.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in and the comment cannot be empty.' });
            return;
        }

        try {
            await addDoc(collection(db, 'shorts', shortId, 'comments'), {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhotoURL: user.photoURL,
                content: newComment,
                timestamp: serverTimestamp(),
            });
            setNewComment('');
            setCommentingOn(null);
            toast({ title: 'Success', description: 'Comment posted!' });
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment.' });
        }
    };

    const handleShare = async (shortId: string) => {
        const short = shorts.find(s => s.id === shortId);
        if (!short) return;

        const shareData = {
            title: `Check out this short from ${short.authorName}!`,
            text: short.title,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                const shortRef = doc(db, 'shorts', shortId);
                await updateDoc(shortRef, { shares: (short.shares || 0) + 1 });
            } catch (error) {
                if ((error as DOMException).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareData.url);
                toast({ title: 'Link copied to clipboard!' });
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Could not copy link.' });
            }
        }
    };


    const ShortSkeleton = () => (
        <Card className="w-full max-w-lg mx-auto bg-card shadow-lg">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="flex justify-around">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-headline font-bold">Video Shorts</h1>
                    <p className="text-muted-foreground mt-2">The latest clips from the Fantom community.</p>
                </div>

                <div className="space-y-8">
                    {loading ? (
                        [...Array(3)].map((_, i) => <ShortSkeleton key={i} />)
                    ) : shorts.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto bg-primary/10 rounded-full h-24 w-24 flex items-center justify-center">
                                <Video className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="mt-6 text-2xl font-headline font-bold">No Shorts Yet</h2>
                            <p className="mt-2 text-muted-foreground">Be the first one to post a short video!</p>
                            <Link href="/shorts/create">
                                <Button variant="primary" className="mt-4">Post a Short</Button>
                            </Link>
                        </div>
                    ) : (
                        shorts.map(short => (
                            <Card key={short.id} className="w-full max-w-lg mx-auto bg-card shadow-lg border-primary/20">
                                <CardContent className="p-4 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={short.authorPhotoURL || `https://i.pravatar.cc/150?u=${short.authorId}`} />
                                            <AvatarFallback>{short.authorName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-primary">{short.authorName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {short.timestamp ? formatDistanceToNow(new Date(short.timestamp.seconds * 1000), { addSuffix: true }) : 'just now'}
                                            </p>
                                        </div>
                                    </div>

                                    <h2 className="text-lg font-semibold">{short.title}</h2>
                                    
                                    <VideoPlayer url={short.videoUrl} />
                                    
                                    <div className="flex justify-around items-center pt-2 border-t border-border/20">
                                        <Button
                                            variant={user && short.likes.includes(user.uid) ? 'primary' : 'ghost'}
                                            className="flex-1"
                                            onClick={() => handleLikeShort(short.id)}
                                            disabled={!user}
                                        >
                                            <ThumbsUp className="mr-2 h-4 w-4" />
                                            Like ({short.likes.length})
                                        </Button>
                                        <Button variant="ghost" className="flex-1" onClick={() => setCommentingOn(commentingOn === short.id ? null : short.id)}>
                                            <MessageSquare className="mr-2 h-4 w-4" />
                                            Comment ({short.comments?.length || 0})
                                        </Button>
                                        <Button variant="ghost" className="flex-1" onClick={() => handleShare(short.id)}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share ({short.shares || 0})
                                        </Button>
                                    </div>
                                    {commentingOn === short.id && (
                                        <div className="pt-4 space-y-4">
                                             {user ? (
                                                <div className="flex items-start gap-2">
                                                    <Textarea 
                                                        placeholder="Add a comment..." 
                                                        className="bg-background/50"
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        rows={1}
                                                    />
                                                    <Button variant="primary" size="icon" onClick={() => handleAddComment(short.id)} disabled={!newComment.trim()}><Send className="h-4 w-4" /></Button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center">You must be <Link href="/admin/login" className="text-primary underline">logged in</Link> to comment.</p>
                                            )}

                                            {short.comments && short.comments.length > 0 && (
                                                <Collapsible>
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="link" size="sm" className="w-full text-muted-foreground">View all {short.comments.length} comments <ChevronDown className="ml-1 h-4 w-4" /></Button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <div className="space-y-4 mt-2">
                                                        {short.comments.map(comment => (
                                                            <div key={comment.id} className="flex items-start gap-3 text-sm">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarImage src={comment.authorPhotoURL || `https://i.pravatar.cc/150?u=${comment.authorId}`} />
                                                                    <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-grow bg-muted/30 p-2 rounded-lg">
                                                                    <span className="font-semibold text-primary mr-2">{comment.authorName}</span>
                                                                    <span>{comment.content}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        </div>
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
