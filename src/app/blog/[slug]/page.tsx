
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, onSnapshot, updateDoc, arrayUnion, arrayRemove, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Header } from "@/components/header";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, MessageSquare, Share2, Trash2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { format, formatDistanceToNow } from 'date-fns';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Footer } from '@/components/footer';


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
    likes: string[]; // Array of user IDs
}

interface Reply {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    content: string;
    timestamp: any;
    likes: string[]; // Array of user IDs
}

interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    authorPhotoURL?: string;
    content: string;
    timestamp: any;
    likes: string[]; // Array of user IDs
    replies: Reply[];
}


export default function BlogPostPage() {
    const { toast } = useToast();
    const [post, setPost] = useState<Post | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    
    const [deletingItem, setDeletingItem] = useState<{commentId: string, replyId?: string} | null>(null);

    const params = useParams();
    const slug = params?.slug as string;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);
    
    // Fetch Post Data and listen for updates
    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const postsRef = collection(db, 'blogPosts');
        const q = query(postsRef, where("slug", "==", slug));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            if (!querySnapshot.empty) {
                const postDoc = querySnapshot.docs[0];
                const docData = postDoc.data();
                if (docData) {
                    const postDate = docData.date ? new Date(docData.date.seconds * 1000) : new Date();
                    setPost({
                        id: postDoc.id,
                        slug: slug,
                        title: docData.title,
                        content: docData.content,
                        author: docData.author || "Fantom eSport",
                        date: postDate,
                        category: docData.category || "News",
                        hint: docData.hint || "gamer portrait",
                        imageUrl: docData.imageUrl,
                        likes: docData.likes || [],
                    });
                } else {
                    setPost(null);
                }
            } else {
                console.warn(`Post with slug "${slug}" not found.`);
                setPost(null);
            }
             setLoading(false);
        }, error => {
            console.error("Error fetching post:", error);
            setPost(null);
            setLoading(false);
        });

        return () => unsubscribe();

    }, [slug]);

    // Listener for Comments and their replies
    useEffect(() => {
        if (!post) return;
        const commentsRef = collection(db, 'blogPosts', post.id, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const commentsData = await Promise.all(
                querySnapshot.docs.map(async (commentDoc) => {
                    const repliesRef = collection(db, 'blogPosts', post.id, 'comments', commentDoc.id, 'replies');
                    const repliesQuery = query(repliesRef, orderBy('timestamp', 'asc'));
                    const repliesSnapshot = await getDocs(repliesQuery);
                    const replies = repliesSnapshot.docs.map(replyDoc => ({ id: replyDoc.id, ...replyDoc.data() } as Reply));

                    return {
                        id: commentDoc.id,
                        ...commentDoc.data(),
                        likes: commentDoc.data().likes || [],
                        replies: replies,
                    } as Comment;
                })
            );
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [post]);

    // Fetch related posts
    useEffect(() => {
        if (!post) return;
        
        const fetchRelatedPosts = async () => {
            const postsRef = collection(db, 'blogPosts');
            const q = query(
                postsRef, 
                orderBy("date", "desc"), 
                limit(5)
            );
            
            try {
                const querySnapshot = await getDocs(q);
                const postsData: Post[] = querySnapshot.docs
                    .map(doc => ({ id: doc.id, slug: doc.data().slug, ...doc.data() } as Post))
                    .filter(p => p.id !== post.id) 
                    .slice(0, 4);
                setRelatedPosts(postsData);
            } catch (error) {
                console.error("Error fetching related posts:", error);
            }
        };

        fetchRelatedPosts();
    }, [post]);


    const handleAddComment = async () => {
        if (!user || !post || !newComment.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in and the comment cannot be empty.' });
            return;
        }

        try {
            await addDoc(collection(db, 'blogPosts', post.id, 'comments'), {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhotoURL: user.photoURL,
                content: newComment,
                timestamp: serverTimestamp(),
                likes: [],
            });
            setNewComment('');
            toast({ title: 'Success', description: 'Comment posted!' });
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to post comment.' });
        }
    };
    
    const handleAddReply = async (commentId: string) => {
        if (!user || !post || !replyContent.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in and the reply cannot be empty.' });
            return;
        }
        
        try {
            const replyRef = collection(db, 'blogPosts', post.id, 'comments', commentId, 'replies');
            await addDoc(replyRef, {
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorPhotoURL: user.photoURL,
                content: replyContent,
                timestamp: serverTimestamp(),
                likes: [],
            });
            setReplyContent('');
            setReplyingTo(null);
            toast({ title: 'Success', description: 'Reply posted!' });
        } catch (error) {
             console.error("Error adding reply: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to post reply.' });
        }
    };
    
    const handleDeleteItem = async () => {
        if (!user || !post || !deletingItem) return;

        const { commentId, replyId } = deletingItem;

        try {
            let itemRef;
            if (replyId) {
                itemRef = doc(db, 'blogPosts', post.id, 'comments', commentId, 'replies', replyId);
            } else {
                itemRef = doc(db, 'blogPosts', post.id, 'comments', commentId);
            }
            await deleteDoc(itemRef);
            toast({ title: 'Success', description: 'Item deleted.' });
        } catch (error) {
            console.error("Error deleting item:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete item.' });
        } finally {
            setDeletingItem(null);
        }
    };

    const handleLikePost = async () => {
        if (!user || !post) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like a post.' });
            return;
        }
        
        const postRef = doc(db, 'blogPosts', post.id);
        
        try {
            if (post.likes.includes(user.uid)) {
                await updateDoc(postRef, {
                    likes: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(user.uid)
                });
            }
        } catch(error) {
            console.error("Error liking post: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.'});
        }
    };

    const handleLikeComment = async (commentId: string, replyId?: string) => {
        if (!user || !post) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like.' });
            return;
        }
        
        const itemRef = replyId 
            ? doc(db, 'blogPosts', post.id, 'comments', commentId, 'replies', replyId)
            : doc(db, 'blogPosts', post.id, 'comments', commentId);
    
        const comment = comments.find(c => c.id === commentId);
        if (!comment) return;
        
        let currentItem;
        if (replyId) {
             currentItem = comment.replies.find(r => r.id === replyId);
        } else {
            currentItem = comment;
        }
        if (!currentItem) return;

        const currentLikes = currentItem.likes || [];
        
        try {
            if (currentLikes.includes(user.uid)) {
                await updateDoc(itemRef, { likes: arrayRemove(user.uid) });
            } else {
                await updateDoc(itemRef, { likes: arrayUnion(user.uid) });
            }
        } catch(error) {
            console.error("Error liking item: ", error);
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
             <div className="flex flex-col min-h-screen bg-background text-foreground">
                <Header />
                 <div className="flex-grow flex flex-col justify-center items-center">
                    <p className="text-2xl font-headline">Post Not Found</p>
                    <p className="text-muted-foreground">The post you are looking for could not be found.</p>
                    <Link href="/blog">
                        <Button variant="ghost" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }
    
    const totalCommentsAndReplies = comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0);
    const hasLikedPost = user ? post.likes.includes(user.uid) : false;

    const CommentCard = ({ item, isReply = false, commentId }: { item: Comment | Reply, isReply?: boolean, commentId?: string }) => {
        const itemLikes = item.likes || [];
        const hasLikedItem = user ? itemLikes.includes(user.uid) : false;
        const isAuthor = user?.uid === item.authorId;

        const handleLikeClick = () => {
            if (isReply && commentId) {
                handleLikeComment(commentId, item.id);
            } else {
                handleLikeComment(item.id);
            }
        };

        return (
            <div className={`flex items-start gap-4`}>
                <Avatar className="w-10 h-10 border-2 border-transparent group-hover:border-primary transition-colors">
                    <AvatarImage src={item.authorPhotoURL || `https://i.pravatar.cc/150?u=${item.authorId}`} />
                    <AvatarFallback>{item.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-primary">{item.authorName}</p>
                        <p className="text-xs text-muted-foreground">
                            {item.timestamp ? formatDistanceToNow(new Date(item.timestamp.seconds * 1000), { addSuffix: true }) : 'just now'}
                        </p>
                    </div>
                    <p className="text-sm text-foreground/80 mt-1">{item.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                        <Button variant="ghost" className="h-auto p-0 flex items-center gap-1 text-muted-foreground hover:text-primary" onClick={handleLikeClick} disabled={!user}>
                           <ThumbsUp className={`h-4 w-4 transition-colors ${hasLikedItem ? 'text-primary' : ''}`}/>
                           {itemLikes.length > 0 && <span>{itemLikes.length}</span>}
                        </Button>

                         {!isReply && (
                            <Button variant="ghost" className="h-auto p-0 flex items-center gap-1 text-muted-foreground hover:text-primary" onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}>
                                Reply
                            </Button>
                        )}
                        {isAuthor && (
                             <Button variant="ghost" className="h-auto p-0 flex items-center gap-1 text-destructive hover:text-destructive/80" onClick={() => setDeletingItem({ commentId: commentId || item.id, replyId: isReply ? item.id : undefined })}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )
    };


  return (
    <>
    <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this item from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingItem(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>


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
                    <div className="relative aspect-video mb-8 rounded-lg overflow-hidden shadow-2xl shadow-black/20">
                      <Image
                          src={post.imageUrl}
                          alt={post.title}
                          fill
                          className="w-full object-cover"
                          data-ai-hint={post.hint}
                      />
                    </div>
                )}
                <div 
                    className="prose prose-invert prose-lg max-w-none mx-auto prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-blockquote:border-primary prose-blockquote:text-foreground/90"
                    dangerouslySetInnerHTML={{ __html: post.content.replace(/\\n/g, '<br />') }} 
                />
                
                <Separator className="my-8 bg-border/20" />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant={hasLikedPost ? 'primary' : 'outline'} size="sm" onClick={handleLikePost} disabled={!user}>
                            <ThumbsUp className="mr-2 h-4 w-4" /> Like ({post.likes.length})
                        </Button>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MessageSquare className="h-4 w-4"/> 
                            <span>{totalCommentsAndReplies} Comments</span>
                        </div>
                    </div>
                     <Button variant="outline" size="sm"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                </div>
                 
                 <Separator className="my-8 bg-border/20" />

                <div className="space-y-8">
                    <h2 className="text-2xl font-headline font-bold">Comments ({totalCommentsAndReplies})</h2>
                    
                    {user ? (
                        <Card className="bg-card shadow-none">
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                     <Avatar>
                                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <Textarea 
                                            placeholder="Add a comment..." 
                                            className="mb-2 bg-background/50"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <Button variant="primary" size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Post Comment</Button>
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

                    <div className="space-y-6">
                        {comments.map((comment) => (
                           <div key={comment.id} className="group">
                                <CommentCard item={comment} />
                                
                                {replyingTo === comment.id && user && (
                                    <div className="ml-12 mt-4">
                                        <Card className="bg-card shadow-none">
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-4">
                                                     <Avatar className="w-8 h-8">
                                                        <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} />
                                                        <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="w-full">
                                                        <Textarea 
                                                            placeholder={`Replying to ${comment.authorName}...`} 
                                                            className="mb-2 bg-background/50"
                                                            value={replyContent}
                                                            onChange={(e) => setReplyContent(e.target.value)}
                                                            rows={2}
                                                        />
                                                        <div className="flex gap-2">
                                                            <Button variant="primary" size="sm" onClick={() => handleAddReply(comment.id)} disabled={!replyContent.trim()}>Post Reply</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {comment.replies && comment.replies.length > 0 && (
                                    <Collapsible className="ml-8 mt-4">
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-xs text-muted-foreground group-data-[state=open]:text-primary">
                                                <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                                {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <div className="pl-4 mt-2 space-y-4 border-l-2 border-border/10 ml-4">
                                                {comment.replies.map(reply => (
                                                    <CommentCard key={reply.id} item={reply} isReply={true} commentId={comment.id} />
                                                ))}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                )}
                           </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-12 bg-border/20" />
                
                {relatedPosts.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-2xl font-headline font-bold mb-6">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block">
                                    <Card className="bg-card border-border overflow-hidden group h-full flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                                        <div className="relative aspect-video">
                                            <Image
                                                src={relatedPost.imageUrl || `https://picsum.photos/400/250?random=${relatedPost.id}`}
                                                alt={relatedPost.title}
                                                fill
                                                className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                                                data-ai-hint={relatedPost.hint}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                            <Badge variant="primary" className="absolute top-2 left-2">{relatedPost.category}</Badge>
                                        </div>
                                        <CardContent className="p-4 flex-grow flex flex-col">
                                            <h3 className="text-md font-headline font-bold uppercase leading-tight mt-1 group-hover:text-primary transition-colors">
                                                {relatedPost.title}
                                            </h3>
                                             <p className="text-xs text-muted-foreground uppercase mt-2">
                                               {relatedPost.date ? format(new Date(relatedPost.date.seconds ? relatedPost.date.seconds * 1000 : relatedPost.date), 'MMM d, yyyy') : ''}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}


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
      <Footer />
    </div>
    </>
  );
}
