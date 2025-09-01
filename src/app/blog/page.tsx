
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  hint: string;
  category: string;
  imageUrl?: string;
  date: any;
}

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
        setLoading(true);
        const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
             id: doc.id,
             slug: doc.data().slug,
             ...doc.data(),
        } as BlogPost));
        
        setBlogPosts(postsData);
        setLoading(false);
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground justify-center items-center">
        <p>Loading posts...</p>
      </div>
    );
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {featuredPost && (
          <section className="relative w-full h-96 text-white flex items-center justify-center text-center">
             <Image
                src={featuredPost.imageUrl || `https://picsum.photos/1200/400?random=${featuredPost.id}`}
                alt={featuredPost.title}
                fill
                className="object-cover opacity-30"
                data-ai-hint={featuredPost.hint}
                priority
             />
             <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
                <Badge variant="primary" className="mb-4">{featuredPost.category}</Badge>
                <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase text-shadow-lg">
                    {featuredPost.title}
                </h1>
                <p className="mt-4 max-w-2xl text-muted-foreground">
                    {featuredPost.content.substring(0, 150)}...
                </p>
                <Link href={`/blog/${featuredPost.slug}`} className="mt-6">
                    <Button variant="primary" size="lg">
                        Read More <ArrowRight className="ml-2" />
                    </Button>
                </Link>
             </div>
          </section>
        )}
        
        <div className="container mx-auto px-4 py-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase mb-12 text-center">
                More Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="bg-card border-border overflow-hidden group h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="relative aspect-video">
                            <Image
                            src={post.imageUrl || `https://picsum.photos/400/250?random=${post.id}`}
                            alt={post.title}
                            fill
                            className="object-cover"
                            data-ai-hint={post.hint}
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                             <Badge variant="primary" className="absolute top-2 left-2">{post.category}</Badge>
                        </div>
                        <CardContent className="p-4 flex-grow flex flex-col">
                            <h3 className="text-lg font-headline font-bold uppercase leading-tight mt-1 group-hover:text-primary transition-colors">
                                {post.title}
                            </h3>
                             <p className="text-sm text-muted-foreground mt-2 flex-grow">
                                {post.content.substring(0, 100)}...
                            </p>
                            <p className="text-xs text-muted-foreground uppercase mt-4">
                               {post.date ? format(new Date(post.date.seconds ? post.date.seconds * 1000 : post.date), 'MMM d, yyyy') : ''}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
