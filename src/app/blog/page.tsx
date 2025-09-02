
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
import { Newspaper } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
           <Skeleton className="w-full h-[500px] rounded-2xl mb-16" />
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                 <div key={i} className="space-y-4">
                   <Skeleton className="aspect-video w-full" />
                   <Skeleton className="h-6 w-3/4" />
                   <Skeleton className="h-4 w-1/2" />
                 </div>
              ))}
           </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (blogPosts.length === 0) {
      return (
         <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Header />
            <main className="flex-grow flex items-center justify-center">
                 <div className="text-center py-16">
                    <div className="mx-auto bg-primary/10 rounded-full h-24 w-24 flex items-center justify-center">
                        <Newspaper className="h-12 w-12 text-primary" />
                    </div>
                    <h2 className="mt-6 text-2xl font-headline font-bold">No Articles Found</h2>
                    <p className="mt-2 text-muted-foreground">There are no news articles yet. Please check back later!</p>
                </div>
            </main>
          <Footer />
        </div>
      )
  }

  const featuredPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {featuredPost && (
          <section className="container mx-auto px-4 pt-12 pb-8">
             <Link href={`/blog/${featuredPost.slug}`}>
                <div className="relative w-full h-[500px] rounded-2xl overflow-hidden group shadow-2xl shadow-black/30">
                    <Image
                        src={featuredPost.imageUrl || `https://picsum.photos/1200/400?random=${featuredPost.id}`}
                        alt={featuredPost.title}
                        fill
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        data-ai-hint={featuredPost.hint}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white">
                        <Badge variant="primary" className="mb-4">{featuredPost.category}</Badge>
                        <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase text-shadow-lg max-w-4xl group-hover:text-primary transition-colors duration-300">
                            {featuredPost.title}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg text-white/80 hidden md:block">
                            {featuredPost.content.substring(0, 150)}...
                        </p>
                    </div>
                </div>
             </Link>
          </section>
        )}
        
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase mb-12 text-center text-white">
                More Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="block">
                    <Card className="bg-card border-border overflow-hidden group h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20">
                        <div className="relative aspect-video overflow-hidden">
                            <Image
                            src={post.imageUrl || `https://picsum.photos/400/250?random=${post.id}`}
                            alt={post.title}
                            fill
                            className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                            data-ai-hint={post.hint}
                            />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                             <Badge variant="primary" className="absolute top-3 left-3">{post.category}</Badge>
                        </div>
                        <CardContent className="p-5 flex-grow flex flex-col">
                            <h3 className="text-lg font-headline font-bold uppercase leading-tight mt-1 group-hover:text-primary transition-colors flex-grow">
                                {post.title}
                            </h3>
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
      <Footer />
    </div>
  );
}
