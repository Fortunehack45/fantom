
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase">
                News & Updates
            </h1>
            <p className="text-muted-foreground mt-2">News, tutorials, and updates from the clan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
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
      </main>
    </div>
  );
}

    