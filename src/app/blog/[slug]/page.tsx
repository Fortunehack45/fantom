
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Header } from "@/components/header";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';


interface Post {
    id: string;
    slug: string;
    title: string;
    author: string;
    date: any;
    category: string;
    hint: string;
    content: string;
    imageUrl?: string;
}

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    content: string;
    timestamp: any;
}

export default function BlogPostPage() {
    const params = useParams();
    const { toast } = useToast();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    
    const [likes, setLikes] = useState<string[]>([]);
    const [hasLiked, setHasLiked] = useState(false);

    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);
    
    // Fetch Post Data
    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) {
                setLoading(false);
                return;
            };

            setLoading(true);
            try {
                const postsRef = collection(db, 'blogPosts');
                const q = query(postsRef, where("slug", "==", slug));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    const docData = doc.data();
                    const postDate = docData.date ? new Date(docData.date.seconds * 1000) : new Date();

                     setPost({
                        id: doc.id,
                        slug: slug,
                        title: docData.title,
                        content: docData.content,
                        author: docData.author || "Fantom eSport",
                        date: postDate,
                        category: docData.category || "News",
                        hint: docData.hint || "gamer portrait",
                        imageUrl: docData.imageUrl,
                    } as Post);
                } else {
                    console.warn(`Post with slug "${slug}" not found.`);
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    // Listener for Comments
    useEffect(() => {
        if (!post) return;
        const commentsRef = collection(db, 'blogPosts', post.id, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const commentsData: Comment[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Comment));
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [post]);
    
    // Listener for Likes
    useEffect(() => {
        if (!post) return;
        const likesRef = collection(db, 'blogPosts', post.id, 'likes');

        const unsubscribe = onSnapshot(likesRef, (snapshot) => {
            const likesUserIds = snapshot.docs.map(doc => doc.id);
            setLikes(likesUserIds);
            if (user) {
                setHasLiked(likesUserIds.includes(user.uid));
            }
        });
        
        return () => unsubscribe();

    }, [post, user]);


    const handleAddComment = async () => {
        if (!user || !post || !newComment.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Cannot post empty comment.' });
            return;
        }

        try {
            await addDoc(collection(db, 'blogPosts', post.id, 'comments'), {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhotoURL: user.photoURL,
                content: newComment,
                timestamp: serverTimestamp(),
            });
            setNewComment('');
            toast({ title: 'Success', description: 'Comment posted!' });
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment.' });
        }
    };

    const handleLikePost = async () => {
        if (!user || !post) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like a post.' });
            return;
        }
        
        const likeRef = doc(db, 'blogPosts', post.id, 'likes', user.uid);
        
        try {
            if (hasLiked) {
                // Unlike
                await deleteDoc(likeRef);
            } else {
                // Like
                await addDoc(likeRef, {});
            }
        } catch(error) {
            console.error("Error liking post: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.'});
        }
    };

    if (loading) {
        return (
             <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
                <p>Loading post...</p>
            </div>
        );
    }
    
    if (!post) {
         return (
             <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
                <p className="text-2xl font-headline">Post Not Found</p>
                <p className="text-muted-foreground">The post you are looking for could not be found.</p>
                 <Link href="/blog">
                    <Button variant="ghost" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Button>
                </Link>
            </div>
        );
    }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow py-12 md:py-24">
        <div className="container mx-auto px-4">
            <article className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <Badge variant="primary">{post.category}</Badge>
                    <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase my-2">{post.title}</h1>
                    <p className="text-muted-foreground text-sm">
                        By {post.author} - Posted {formatDistanceToNow(post.date, { addSuffix: true })}
                    </p>
                </header>
                {post.imageUrl && (
                    <div className="relative aspect-video mb-8">
                      <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="w-full rounded-lg object-cover"
                          data-ai-hint={post.hint}
                      />
                    </div>
                )}
                <div 
                    className="prose prose-invert prose-lg max-w-none mx-auto prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\\n/g, '<br />') }} 
                />
                
                <Separator className="my-8 bg-border/20" />

                {/* Interactions Section */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant={hasLiked ? 'primary' : 'outline'} size="sm" onClick={handleLikePost} disabled={!user}>
                            <ThumbsUp className="mr-2" /> Like ({likes.length})
                        </Button>
                        <Button variant="outline" size="sm"><MessageSquare className="mr-2" /> Comment ({comments.length})</Button>
                    </div>
                     <Button variant="outline" size="sm"><Share2 className="mr-2" /> Share</Button>
                </div>
                 
                 <Separator className="my-8 bg-border/20" />

                 {/* Comments Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-headline font-bold">Comments ({comments.length})</h2>
                    
                    {user ? (
                        <Card className="bg-card">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                     <Avatar>
                                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <Textarea 
                                            placeholder="Add a comment..." 
                                            className="mb-2"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button variant="primary" size="sm" onClick={handleAddComment}>Post Comment</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-card">
                           <CardContent className="p-4 text-center text-muted-foreground">
                                <p>You must be <Link href="/admin/login" className="text-primary underline">logged in</Link> to post a comment.</p>
                           </CardContent>
                        </Card>
                    )}

                    {/* Existing Comments */}
                    <div className="space-y-6">
                        {comments.map((comment) => (
                             <div key={comment.id} className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={comment.authorPhotoURL || `https://i.pravatar.cc/150?u=${comment.authorId}`} />
                                    <AvatarFallback>{comment.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-primary">{comment.authorName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp.seconds * 1000), { addSuffix: true }) : 'just now'}
                                    </p>
                                </div>
                                    <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
                                     <div className="flex items-center gap-4 mt-2 text-xs">
                                        <button className="hover:text-primary">Like</button>
                                        <button className="hover:text-primary">Reply</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-12 text-center">
                     <Link href="/blog">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to News
                        </Button>
                    </Link>
                </div>
            </article>
        </div>
      </main>
    </div>
  );
}

    