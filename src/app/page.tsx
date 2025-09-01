'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Gamepad2, Users } from "lucide-react";
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

interface Team {
    id: string;
    name: string;
    memberCount: number;
    logoUrl: string;
}

const teams: Team[] = [
    { id: '1', name: 'League of Legends', memberCount: 9, logoUrl: '/icons/lol.svg' },
    { id: '2', name: 'PUBG', memberCount: 16, logoUrl: '/icons/pubg.svg' },
    { id: '3', name: 'Fortnite', memberCount: 12, logoUrl: '/icons/fortnite.svg' },
    { id: '4', name: 'Rainbow 6 Siege', memberCount: 6, logoUrl: '/icons/r6.svg' },
    { id: '5', name: 'Super Smash Bros', memberCount: 2, logoUrl: '/icons/smash.svg' },
    { id: '6', name: 'Apex Legends', memberCount: 5, logoUrl: '/icons/apex.svg' },
    { id: '7', name: 'Magic the Gathering', memberCount: 1, logoUrl: '/icons/mtg.svg' },
    { id: '8', name: 'World of Warcraft', memberCount: 1, logoUrl: '/icons/wow.svg' },
    { id: '9', name: 'Valorant', memberCount: 5, logoUrl: '/icons/valorant.svg' },
    { id: '10', name: 'Teamfight Tactics', memberCount: 3, logoUrl: '/icons/tft.svg' },
    { id: '11', name: 'Twitch Team', memberCount: 3, logoUrl: '/icons/twitch.svg' },
];

export default function Home() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    
    useEffect(() => {
        const fetchBlogPosts = async () => {
            const q = query(collection(db, "blogPosts"), limit(5));
            const querySnapshot = await getDocs(q);
            const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data()
            } as BlogPost));
            if (postsData.length > 0) {
                setBlogPosts(postsData);
            } else {
                 setBlogPosts([
                    { id: 'static-1', slug: "the-ultimate-guide-to-winning", title: "Roster Swap for TSM Rainbow 6", content: "Discover the strategies and tips from our pro players to dominate the competition...", hint: "fantasy character art", category: "Rainbow Six Siege", imageUrl: "https://picsum.photos/600/400?random=1", date: new Date('2024-08-17') },
                    { id: 'static-2', slug: "new-season-new-goals", title: "Welcome Back TSM PUBG", content: "The new season is upon us! Here's what we're aiming for as a clan...", hint: "esports team strategy", category: "PUBG", imageUrl: "https://picsum.photos/600/400?random=2", date: new Date('2024-08-04') },
                    { id: 'static-3', slug: "community-spotlight-ernestodks412", title: "TannerSlays joins TSM Apex Legends", content: "An interview with one of our most legendary members...", hint: "gamer portrait", category: "Apex Legends", imageUrl: "https://picsum.photos/600/400?random=3", date: new Date('2024-07-29') },
                    { id: 'static-4', slug: 'welcome-tsm-mackwood', title: 'Welcome TSM Mackwood!', content: '...', hint: 'gamer portrait', category: 'Fortnite', imageUrl: 'https://picsum.photos/600/400?random=4', date: new Date('2024-07-05') },
                    { id: 'static-5', slug: 'hiring-ecommerce-manager', title: 'Hiring: E-Commerce Manager', content: '...', hint: 'office computer', category: 'TSM News', imageUrl: 'https://picsum.photos/600/400?random=5', date: new Date('2024-06-02') },
                ]);
            }
        };
        fetchBlogPosts();
      }, []);

  const mainPost = blogPosts[0];
  const otherPosts = blogPosts.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero & News Section */}
        <section id="news" className="py-12 md:py-20">
            <div className="container mx-auto px-4">
               {mainPost && (
                 <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
                    <div className="relative aspect-video">
                         <Image
                            src={mainPost.imageUrl || "https://picsum.photos/1280/720"}
                            alt={mainPost.title}
                            fill
                            className="object-cover rounded-lg"
                            data-ai-hint={mainPost.hint}
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase leading-none">
                            {mainPost.title}
                        </h1>
                        <p className="mt-4 text-muted-foreground max-w-lg">
                           {mainPost.content.substring(0, 150)}...
                        </p>
                        <Link href={`/blog/${mainPost.slug}`}>
                            <Button variant="link" className="text-lg p-0 mt-4">
                                Read More <ChevronRight className="ml-1"/>
                            </Button>
                        </Link>
                    </div>
                </div>
               )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherPosts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                            <Card className="bg-card border-border overflow-hidden group h-full flex flex-col">
                               <div className="relative aspect-video">
                                    <Image
                                        src={post.imageUrl || "https://picsum.photos/600/400"}
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
                 <div className="text-center mt-12">
                    <Link href="/blog">
                        <Button variant="outline" size="lg">All News <ChevronRight className="ml-2" /></Button>
                    </Link>
                </div>
            </div>
        </section>

        {/* Teams Section */}
        <section id="teams" className="py-16 md:py-24 bg-card/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Meet Our Teams
                    </h2>
                    <p className="text-primary font-bold text-xl">#FANTOMWIN</p>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {teams.map((team) => (
                        <Card key={team.id} className="bg-muted/40 border-border p-4 rounded-lg flex flex-col items-center justify-center text-center group hover:bg-primary/10 hover:border-primary transition-colors">
                           <div className="relative w-12 h-12 mb-3">
                            <Image src={team.logoUrl} alt={`${team.name} logo`} fill className="object-contain" />
                           </div>
                           <h3 className="font-bold uppercase text-sm">{team.name}</h3>
                           <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {team.memberCount} Members</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Shop Section */}
        <section id="shop" className="py-16 md:py-24">
             <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                     <div>
                        <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                            Shop Official Fantom Apparel & Accessories
                        </h2>
                         <p className="mt-4 text-muted-foreground max-w-lg">
                            Apparel and accessories from the one and only Fantom eSport including pro jersey, member items, and more.
                        </p>
                         <Button variant="primary" size="lg" className="mt-6">
                            Shop Now <ChevronRight className="ml-2" />
                        </Button>
                    </div>
                    <div className="relative aspect-square max-w-md mx-auto md:mx-0 md:ml-auto">
                        <Image
                            src="https://picsum.photos/600/600?random=pro-player-1"
                            alt="Fantom Pro Player"
                            fill
                            className="object-cover rounded-full z-10"
                            data-ai-hint="esports player portrait"
                        />
                         <Image
                            src="https://picsum.photos/600/600?random=pro-player-2"
                            alt="Fantom Pro Player 2"
                            width={300}
                            height={300}
                            className="object-cover rounded-full absolute -bottom-1/4 -left-1/4 z-0 opacity-50"
                            data-ai-hint="esports player portrait female"
                        />
                    </div>
                </div>
             </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
