
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, onSnapshot, updateDoc, arrayUnion, arrayRemove, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Header } from "@/components/header";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
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
    const params = useParams();
    const { toast } = useToast();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);
    
    // Fetch Post Data and listen for updates on likes
    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        const fetchPost = async () => {
            setLoading(true);
            try {
                const postsRef = collection(db, 'blogPosts');
                const q = query(postsRef, where("slug", "==", slug));
                const querySnapshot = await getDocs(q);
                
                if (!querySnapshot.empty) {
                    const postDoc = querySnapshot.docs[0];
                    // Set up a real-time listener for the post
                    const unsubscribe = onSnapshot(doc(db, 'blogPosts', postDoc.id), (doc) => {
                         const docData = doc.data();
                         if (docData) {
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
                                likes: docData.likes || [],
                            } as Post);
                         } else {
                            setPost(null);
                         }
                    });
                    setLoading(false);
                    return unsubscribe; 
                } else {
                    console.warn(`Post with slug "${slug}" not found.`);
                    setPost(null);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
                setPost(null);
                setLoading(false);
            }
        };

        const unsubscribePost = fetchPost();
        
        return () => {
            unsubscribePost.then(unsub => unsub && unsub());
        };

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
                replies: [],
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

    const handleLikePost = async () => {
        if (!user || !post) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to like a post.' });
            return;
        }
        
        const postRef = doc(db, 'blogPosts', post.id);
        const hasLiked = post.likes.includes(user.uid);
        
        try {
            if (hasLiked) {
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

        const path = replyId 
            ? `blogPosts/${post.id}/comments/${commentId}/replies/${replyId}`
            : `blogPosts/${post.id}/comments/${commentId}`;
        
        const itemRef = doc(db, path);

        try {
            // Find the correct item in the local state to check if it's liked
            let currentLikes: string[] = [];
            if(replyId){
                const comment = comments.find(c => c.id === commentId);
                const reply = comment?.replies.find(r => r.id === replyId);
                currentLikes = reply?.likes || [];
            } else {
                const comment = comments.find(c => c.id === commentId);
                currentLikes = comment?.likes || [];
            }
        
            const hasLikedItem = currentLikes.includes(user.uid);

            if (hasLikedItem) {
                await updateDoc(itemRef, { likes: arrayRemove(user.uid) });
            } else {
                await updateDoc(itemRef, { likes: arrayUnion(user.uid) });
            }
        } catch(error) {
             console.error("Error liking item: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.'});
        }
    }


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
    
    const totalCommentsAndReplies = comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0);
    const hasLikedPost = user ? post.likes.includes(user.uid) : false;

    const CommentCard = ({ item, isReply, commentId }: { item: Comment | Reply, isReply: boolean, commentId?: string }) => {
        const itemLikes = item.likes || [];
        const hasLikedItem = user ? itemLikes.includes(user.uid) : false;
        const replyCount = !isReply ? (item as Comment).replies.length : 0;

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
                           <span>{itemLikes.length > 0 ? itemLikes.length : ''}</span>
                        </Button>

                         {!isReply && (
                            <Button variant="ghost" className="h-auto p-0 flex items-center gap-1 text-muted-foreground hover:text-primary" onClick={() => setReplyingTo(replyingTo === item.id ? null : item.id)}>
                                Reply
                                {replyCount > 0 && <span className="text-xs ml-1">({replyCount})</span>}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        )
    };


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
                        <Button variant={hasLikedPost ? 'primary' : 'outline'} size="sm" onClick={handleLikePost} disabled={!user}>
                            <ThumbsUp className="mr-2" /> Like ({post.likes.length})
                        </Button>
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MessageSquare /> 
                            <span>{totalCommentsAndReplies} Comments</span>
                        </div>
                    </div>
                     <Button variant="outline" size="sm"><Share2 className="mr-2" /> Share</Button>
                </div>
                 
                 <Separator className="my-8 bg-border/20" />

                 {/* Comments Section */}
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
                           <div key={comment.id} className="group">
                                <CommentCard item={comment} isReply={false} />
                                
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
                                                            <Button variant="primary" size="sm" onClick={() => handleAddReply(comment.id)}>Post Reply</Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {comment.replies && comment.replies.length > 0 && (
                                     <div className="pl-12 mt-4 space-y-4 border-l-2 border-border/10 ml-5">
                                        {comment.replies.map(reply => (
                                            <CommentCard key={reply.id} item={reply} isReply={true} commentId={comment.id} />
                                        ))}
                                    </div>
                                )}
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


    