
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Post {
    id: string;
    slug: string;
    title: string;
    author: string;
    date: string;
    category: string;
    hint: string;
    content: string;
    imageUrl?: string;
}


export default function BlogPostPage({ params }: { params: { slug: string } }) {
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const slug = params.slug;
        if (!slug) return;

        const fetchPost = async () => {
            setLoading(true);
            const postsRef = collection(db, 'blogPosts');
            const q = query(postsRef, where("slug", "==", slug));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const docData = doc.data();
                 setPost({
                    id: doc.id,
                    slug: slug,
                    title: docData.title,
                    content: docData.content,
                    author: docData.author || "Fantom eSport",
                    date: docData.date ? new Date(docData.date.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString(),
                    category: docData.category || "News",
                    hint: docData.hint || "gamer portrait",
                    imageUrl: docData.imageUrl,
                } as Post);
            } else {
                const staticPost = {
                    id: 'not-found',
                    slug: slug,
                    title: "Post Not Found",
                    author: "System",
                    date: new Date().toLocaleDateString(),
                    category: "Error",
                    hint: "not found",
                    imageUrl: "https://picsum.photos/1200/600",
                    content: `<p>The post you are looking for could not be found. It might have been moved or deleted.</p>`
                };
                setPost(staticPost);
            }
            setLoading(false);
        };

        fetchPost();
    }, [params]);

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
                <p>Post not found.</p>
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
            <div className="mb-8">
                 <Link href="/blog">
                    <Button variant="ghost">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Button>
                </Link>
            </div>
            <article className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <Badge variant="primary" className="mb-4">{post.category}</Badge>
                    <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">{post.title}</h1>
                    <p className="text-muted-foreground">
                        By {post.author} on {post.date}
                    </p>
                </header>
                <Image
                    src={post.imageUrl || `https://picsum.photos/1200/600`}
                    alt={post.title}
                    width={1200}
                    height={600}
                    className="w-full rounded-lg mb-8"
                    data-ai-hint={post.hint}
                />
                <div 
                    className="prose prose-invert prose-lg max-w-none mx-auto"
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
            </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
