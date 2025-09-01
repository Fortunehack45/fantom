
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
        if (!params.slug) return;

        const fetchPost = async () => {
            setLoading(true);
            const postsRef = collection(db, 'blogPosts');
            const q = query(postsRef, where("slug", "==", params.slug));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                 setPost({
                    slug: params.slug,
                    title: docData.title,
                    content: docData.content,
                    author: "Fantom eSport",
                    date: new Date().toLocaleDateString(),
                    category: "News",
                    hint: "gamer portrait",
                    imageUrl: docData.imageUrl,
                });
            } else {
                 // Fallback to static post if not found in DB
                const staticPost = {
                    slug: params.slug,
                    title: "The Ultimate Guide to Winning",
                    author: "ErnestoDKS412",
                    date: "July 26, 2024",
                    category: "Tutorial",
                    hint: "fantasy character art",
                    imageUrl: "https://picsum.photos/1200/600",
                    content: `
            <p>Welcome to the ultimate guide to winning. In the fast-paced world of competitive gaming, every decision matters. Whether you're a seasoned veteran or a newcomer looking to make your mark, the right strategies can be the difference between victory and defeat. This guide is designed to provide you with the essential tips, tricks, and mindsets required to elevate your game.</p>
            <h3 class="text-2xl font-headline mt-8 mb-4">Mastering the Fundamentals</h3>
            <p>Before diving into advanced tactics, it's crucial to have a rock-solid foundation. This means understanding the core mechanics of the game inside and out. Spend time in practice mode, learn the maps, and get a feel for every weapon and ability. Don't just learn what they do; understand when and why to use them.</p>
            <ul class="list-disc list-inside space-y-2 my-4">
              <li><strong>Map Awareness:</strong> Always be aware of your surroundings. Know the common choke points, flanking routes, and high-traffic areas.</li>
              <li><strong>Communication:</strong> Clear and concise communication with your team is non-negotiable. Call out enemy positions, coordinate attacks, and share vital information.</li>
              <li><strong>Aim & Movement:</strong> Consistently practice your aim. Use aim trainers and drills to improve your muscle memory. Fluid movement is just as important; practice strafing, peeking, and using cover effectively.</li>
            </ul>
            <h3 class="text-2xl font-headline mt-8 mb-4">Advanced Strategies</h3>
            <p>Once you've mastered the basics, it's time to layer on more complex strategies. This is where game sense and adaptability come into play.</p>
            <ol class="list-decimal list-inside space-y-2 my-4">
              <li><strong>Economy Management:</strong> In games with an economy system, making smart buys is critical. Understand when to save, when to full-buy, and when to force-buy.</li>
              <li><strong>Positional Play:</strong> Your position on the map can give you a significant advantage. Control key angles, use verticality, and play to your weapon's strengths.</li>
              <li><strong>Psychological Warfare:</strong> Get inside your opponent's head. Be unpredictable, bait out their abilities, and capitalize on their mistakes.</li>
            </ol>
            <p>By focusing on these areas, you'll be well on your way to dominating the competition and climbing the ranks. Remember, consistency is key. Keep practicing, stay positive, and never stop learning.</p>
            `
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
