
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('News');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a post.' });
                router.push('/admin/login');
            }
        });
        return () => unsubscribe();
    }, [router, toast]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
            return;
        }
        if (!title.trim() || !content.trim() || !category.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Title, Content, and Category are required.' });
            return;
        }

        setLoading(true);
        try {
            const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const docRef = await addDoc(collection(db, "blogPosts"), {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                title,
                slug,
                content,
                category,
                imageUrl: imageUrl || `https://picsum.photos/1200/800?random=${Date.now()}`,
                hint: "gaming background",
                date: serverTimestamp(),
                likes: [],
            });
            toast({ title: "Success!", description: "Your blog post has been published." });
            router.push(`/blog/${slug}`);
        } catch (error) {
            console.error("Error creating post: ", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to create post." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Create a New Post</CardTitle>
                        <CardDescription>Share your thoughts, news, or updates with the community.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreatePost} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Your Post Title"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="e.g., News, Guide"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="imageUrl">Image URL (Optional)</Label>
                                    <Input
                                        id="imageUrl"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://example.com/image.png"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Write your article here... Basic HTML is supported."
                                    rows={12}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" variant="primary" disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
