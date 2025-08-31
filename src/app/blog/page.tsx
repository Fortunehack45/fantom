
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  hint: string;
  category: string;
}

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
        const querySnapshot = await getDocs(collection(db, "blogPosts"));
        const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
             id: doc.id,
             slug: doc.data().title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
             title: doc.data().title,
             content: doc.data().content,
             imageUrl: doc.data().imageUrl,
             hint: "gamer portrait",
             category: "News"
        }));
        
        const staticPosts = [
            { id: 'static-1', slug: "the-ultimate-guide-to-winning", title: "The Ultimate Guide to Winning", content: "Discover the strategies and tips from our pro players to dominate the competition and climb the ranks...", hint: "fantasy character art", category: "Tutorial" },
            { id: 'static-2', slug: "new-season-new-goals", title: "New Season, New Goals", content: "The new season is upon us! Here's what we're aiming for as a clan and how you can get involved.", hint: "esports team strategy", category: "News" },
            { id: 'static-3', slug: "community-spotlight-ernestodks412", title: "Community Spotlight: ErnestoDKS412", content: "An interview with one of our most legendary members. Learn about their journey in Fantom eSport.", hint: "gamer portrait", category: "Interview" },
            { id: 'static-4', slug: "top-5-strategies-for-the-new-map", title: "Top 5 Strategies for the New Map", content: "Master the latest battlefield with these proven strategies from our top players.", hint: "fantasy map", category: "Tutorial" },
            { id: 'static-5', slug: "clan-wars-recap-a-victorious-week", title: "Clan Wars Recap: A Victorious Week", content: "We crushed it this week in Clan Wars! Read all about our epic wins and top performers.", hint: "battle scene", category: "Recap" },
            { id: 'static-6', slug: "meet-the-new-recruits", title: "Meet the New Recruits", content: "Welcome the newest members of the Fantom eSport family. Let's give them a warm welcome!", hint: "team photo", category: "Community" },
        ];
        
        setBlogPosts([...staticPosts, ...postsData]);
    };

    fetchBlogPosts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Fantom eSport Blog
            </h1>
            <p className="text-muted-foreground mt-2">News, tutorials, and updates from the clan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden flex flex-col h-full hover:border-primary transition-colors">
                    <CardHeader className="p-0 relative">
                        <Image
                        src={`https://picsum.photos/400/${250 + i}`}
                        alt="Blog Post Image"
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover"
                        data-ai-hint={post.hint}
                        />
                        <Badge className="absolute top-2 left-2" variant="primary">{post.category}</Badge>
                    </CardHeader>
                    <CardContent className="p-6 flex-grow flex flex-col">
                        <CardTitle className="text-xl font-headline mb-2">{post.title}</CardTitle>
                        <p className="text-muted-foreground text-sm flex-grow">
                        {post.content}
                        </p>
                    </CardContent>
                </Card>
            </Link>
            ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
