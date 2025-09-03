
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';

export default function CreateShortPage() {
    const [title, setTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a short.' });
                router.push('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router, toast]);
    
    const isVideoUrlValid = (url: string) => {
      try {
        const urlObj = new URL(url);
        const host = urlObj.hostname;
        return host.includes('youtube.com') || host.includes('youtu.be') || host.includes('tiktok.com') || host.includes('facebook.com');
      } catch (e) {
        return false;
      }
    };


    const handleCreateShort = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
            return;
        }
        if (!title.trim() || !videoUrl.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title and Video URL are required.' });
            return;
        }
        if (!isVideoUrlValid(videoUrl)) {
            toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please provide a valid YouTube, TikTok, or Facebook video URL.' });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, "shorts"), {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhotoURL: user.photoURL,
                title,
                videoUrl,
                timestamp: serverTimestamp(),
                likes: [],
                shares: 0,
            });
            toast({ title: "Success!", description: "Your video short has been published." });
            router.push(`/shorts`);
        } catch (error) {
            console.error("Error creating short: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to create short." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Post a New Short</CardTitle>
                        <CardDescription>Share a video clip with the community.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateShort} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Your Short Title"
                                    required
                                    maxLength={100}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="videoUrl">Video URL</Label>
                                <Input
                                    id="videoUrl"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="YouTube, TikTok, or Facebook link"
                                    required
                                />
                            </div>

                            {videoUrl && isVideoUrlValid(videoUrl) && (
                                <div className="space-y-2">
                                    <Label>Video Preview</Label>
                                    <VideoPlayer url={videoUrl} />
                                </div>
                            )}

                            <Button type="submit" className="w-full" variant="primary" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? 'Publishing...' : 'Publish Short'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
