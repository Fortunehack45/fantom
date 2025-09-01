'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from 'date-fns';

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
        const querySnapshot = await getDocs(collection(db, "blogPosts"));
        const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data(),
        } as BlogPost));
        
        if (postsData.length > 0) {
            setBlogPosts(postsData);
        } else {
            const staticPosts = [
                { id: 'static-1', slug: "the-ultimate-guide-to-winning", title: "Roster Swap for TSM Rainbow 6", content: "Discover the strategies and tips from our pro players to dominate the competition...", hint: "fantasy character art", category: "Rainbow Six Siege", imageUrl: "https://picsum.photos/600/400?random=1", date: new Date('2024-08-17') },
                { id: 'static-2', slug: "new-season-new-goals", title: "Welcome Back TSM PUBG", content: "The new season is upon us! Here's what we're aiming for as a clan...", hint: "esports team strategy", category: "PUBG", imageUrl: "https://picsum.photos/600/400?random=2", date: new Date('2024-08-04') },
                { id: 'static-3', slug: "community-spotlight-ernestodks412", title: "TannerSlays joins TSM Apex Legends", content: "An interview with one of our most legendary members...", hint: "gamer portrait", category: "Apex Legends", imageUrl: "https://picsum.photos/600/400?random=3", date: new Date('2024-07-29') },
                { id: 'static-4', slug: 'welcome-tsm-mackwood', title: 'Welcome TSM Mackwood!', content: '...', hint: 'gamer portrait', category: 'Fortnite', imageUrl: 'https://picsum.photos/600/400?random=4', date: new Date('2024-07-05') },
                { id: 'static-5', slug: 'hiring-ecommerce-manager', title: 'Hiring: E-Commerce Manager', content: '...', hint: 'office computer', category: 'TSM News', imageUrl: 'https://picsum.photos/600/400?random=5', date: new Date('2024-06-02') },
                { id: 'static-6', slug: "meet-the-new-recruits", title: "Meet the New Recruits", content: "Welcome the newest members of the Fantom eSport family. Let's give them a warm welcome!", hint: "team photo", category: "Community", imageUrl: "https://picsum.photos/400/250?random=6", date: new Date('2024-05-15') },
            ];
            setBlogPosts(staticPosts);
        }
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
                Fantom eSport News
            </h1>
            <p className="text-muted-foreground mt-2">News, tutorials, and updates from the clan.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="bg-card border-border overflow-hidden group h-full flex flex-col">
                    <div className="relative aspect-video">
                        <Image
                        src={post.imageUrl || `https://picsum.photos/400/250?random=${post.id}`}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        data-ai-hint={post.hint}
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <CardContent className="p-4 flex-grow flex flex-col">
                        <p className="text-xs text-muted-foreground uppercase">
                           {post.date ? format(new Date(post.date.seconds ? post.date.seconds * 1000 : post.date), 'MMM d, yyyy') : ''} | {post.category}
                        </p>
                        <h3 className="text-lg font-headline font-bold uppercase leading-tight mt-1 group-hover:text-primary transition-colors">
                            {post.title}
                        </h3>
                    </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
