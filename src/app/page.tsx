

'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from "@/components/ui/table";
import { ArrowRight, ChevronRight, Dot, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { FantomIcon } from '@/components/icons';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  hint: string;
  category: string;
  imageUrl?: string;
}

interface RosterMember {
    id: string;
    name: string;
    role: string;
    server: string;
}

interface Announcement {
    id: string;
    author: string;
    content: string;
    date: string;
    authorImageUrl?: string;
}

const games = [
    { name: "Game Title 1", hint: "fantasy battle scene", imageUrl: "https://picsum.photos/500/700?random=1" },
    { name: "Game Title 2", hint: "sci-fi soldier", imageUrl: "https://picsum.photos/500/700?random=2" },
    { name: "Game Title 3", hint: "esports arena", imageUrl: "https://picsum.photos/500/700?random=3" },
    { name: "Game Title 4", hint: "dragon video game", imageUrl: "https://picsum.photos/500/700?random=4" },
]

export default function Home() {
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    
    useEffect(() => {
        const fetchBlogPosts = async () => {
            const q = query(collection(db, "blogPosts"), limit(3));
            const querySnapshot = await getDocs(q);
            const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
                 id: doc.id,
                 slug: doc.data().title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                 ...doc.data()
            } as BlogPost));
            if (postsData.length > 0) {
                setBlogPosts(postsData);
            } else {
                 setBlogPosts([
                    { id: 'static-1', slug: "the-ultimate-guide-to-winning", title: "The Ultimate Guide to Winning", content: "Discover the strategies and tips from our pro players to dominate the competition...", hint: "fantasy character art", category: "Tutorial", imageUrl: "https://picsum.photos/400/250?q=static-1" },
                    { id: 'static-2', slug: "new-season-new-goals", title: "New Season, New Goals", content: "The new season is upon us! Here's what we're aiming for as a clan...", hint: "esports team strategy", category: "News", imageUrl: "https://picsum.photos/400/250?q=static-2" },
                    { id: 'static-3', slug: "community-spotlight-ernestodks412", title: "Community Spotlight: ErnestoDKS412", content: "An interview with one of our most legendary members...", hint: "gamer portrait", category: "Interview", imageUrl: "https://picsum.photos/400/250?q=static-3" },
                ]);
            }
        };
        const fetchRoster = async () => {
            const q = query(collection(db, "roster"), limit(5));
            const querySnapshot = await getDocs(q);
            const rosterData: RosterMember[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
             if (rosterData.length > 0) {
                setRoster(rosterData);
            } else {
                setRoster([
                    { id: '1', name: 'ShadowStriker', role: 'Legendary', server: 'L2Eve x1' },
                    { id: '2', name: 'Vortex', role: 'Pro', server: 'L2Eve x1' },
                    { id: '3', name: 'Phoenix', role: 'Pro', server: 'L2Eve x1' },
                    { id: '4', name: 'Fury', role: 'New Member', server: 'Moon-Land' },
                    { id: '5', name: 'Ghost', role: 'New Member', server: 'Moon-Land' },
                ]);
            }
        };
        const fetchAnnouncements = async () => {
            const q = query(collection(db, "announcements"), limit(3));
            const querySnapshot = await getDocs(q);
            const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                date: new Date().toLocaleDateString()
            } as Announcement));
            if (announcementsData.length > 0) {
                setAnnouncements(announcementsData);
            } else {
                setAnnouncements([
                     { id: '1', author: 'ClanMaster', content: 'Big clan meeting this Friday! Be there!', date: new Date().toLocaleDateString(), authorImageUrl: "https://picsum.photos/40/40?random=1" },
                     { id: '2', author: 'ViceMaster', content: 'New raid strategy is up on the forums. Make sure to read it.', date: new Date().toLocaleDateString(), authorImageUrl: "https://picsum.photos/40/40?random=2" },
                     { id: '3', author: 'RecruitmentOfficer', content: 'We are officially opening recruitment for two new spots. Spread the word!', date: new Date().toLocaleDateString(), authorImageUrl: "https://picsum.photos/40/40?random=3" },
                ]);
            }
        };

        fetchBlogPosts();
        fetchRoster();
        fetchAnnouncements();
      }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center text-center text-white overflow-hidden">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Fantasy background"
            fill
            className="object-cover object-center z-0"
            data-ai-hint="dark fantasy landscape"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent z-10" />
          <div className="relative z-20 flex flex-col items-center">
            <FantomIcon className="w-96 h-auto" />
             <p className="font-headline text-2xl uppercase tracking-widest text-shadow">Strength and Victory</p>
          </div>
           <Image
            src="https://picsum.photos/800/1000"
            alt="Character Portrait"
            width={800}
            height={1000}
            className="absolute right-0 bottom-0 z-10 object-contain h-full w-auto"
            data-ai-hint="male warrior elf"
          />
        </section>

        {/* Servers Section */}
        <section className="py-16 container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-card border border-border p-6 rounded-lg flex items-center gap-4 hover:border-primary transition-colors">
                     <Dot className="text-green-500 w-12 h-12 flex-shrink-0" />
                     <div>
                         <h3 className="font-headline text-lg">L2Eve x1 Interlude Retail Like</h3>
                         <p className="text-sm text-muted-foreground">Join our main server for an epic retail-like experience with balanced progression.</p>
                         <div className="flex items-center gap-4 mt-2">
                             <Button variant="secondary" size="sm">Discord</Button>
                         </div>
                     </div>
                      <ChevronRight className="ml-auto text-muted-foreground" />
                 </div>
                 <div className="bg-card border border-border p-6 rounded-lg flex items-center gap-4 hover:border-primary transition-colors">
                     <Dot className="text-green-500 w-12 h-12 flex-shrink-0" />
                     <div>
                         <h3 className="font-headline text-lg">Moon-Land Interlude Remastered</h3>
                         <p className="text-sm text-muted-foreground">Experience a remastered world with unique features and challenging gameplay.</p>
                         <div className="flex items-center gap-4 mt-2">
                             <Button variant="secondary" size="sm">Discord</Button>
                         </div>
                     </div>
                     <ChevronRight className="ml-auto text-muted-foreground" />
                 </div>
             </div>
        </section>

        {/* Games We Play Section */}
        <section id="games" className="py-16 md:py-24 bg-card/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">Our Battlegrounds</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Games We Play
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {games.map((game) => (
                        <Card key={game.name} className="bg-background border-border overflow-hidden group">
                           <div className="relative">
                                <Image
                                    src={game.imageUrl}
                                    alt={game.name}
                                    width={500}
                                    height={700}
                                    className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                                    data-ai-hint={game.hint}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-4">
                                     <h3 className="text-xl font-headline text-white">{game.name}</h3>
                                </div>
                           </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>


        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">Read our most recent blog posts</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Recent Articles
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                        <Card className="bg-card border-border overflow-hidden flex flex-col h-full hover:border-primary transition-colors group">
                            <div className="relative">
                                <Image
                                src={post.imageUrl || `https://picsum.photos/400/250?q=${post.id}`}
                                alt="Blog Post Image"
                                width={400}
                                height={250}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                data-ai-hint={post.hint}
                                />
                                 <Badge className="absolute top-2 left-2" variant="primary">{post.category}</Badge>
                            </div>
                            <CardContent className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-headline mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                                <p className="text-muted-foreground text-sm flex-grow">
                                {post.content.substring(0, 100)}...
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                    ))}
                </div>
                <div className="text-center mt-12">
                    <Link href="/blog">
                        <Button variant="outline">View All Posts <ArrowRight className="ml-2" /></Button>
                    </Link>
                </div>
            </div>
        </section>
        
        {/* Clan Roster & Recruitment */}
        <section id="roster" className="py-16 md:py-24 bg-card/50">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">We are the best of the best</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Our Clan Roster
                    </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center">
                        <h3 className="font-headline text-2xl uppercase mb-4">Join Our Ranks</h3>
                        <p className="text-muted-foreground mb-6">
                            Become a part of our legendary team. We are always looking for skilled and dedicated players to conquer new challenges.
                        </p>
                         <Button variant="primary" size="lg">Recruitment</Button>
                    </div>
                    <div className="lg:col-span-2 bg-card border border-border rounded-lg">
                        <div className="flex justify-between items-center p-6">
                            <h3 className="font-headline text-2xl uppercase">Clan Members</h3>
                             <div>
                                 <Button variant="ghost" size="sm">Server 1</Button>
                                 <Button variant="ghost" size="sm" className="text-muted-foreground">Server 2</Button>
                             </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b-white/10">
                                    <TableHead>Name</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Server</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roster.map((member) => (
                                    <TableRow key={member.id} className="border-b-white/10">
                                        <TableCell className="font-bold">{member.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={member.role === 'Legendary' ? 'primary' : member.role === 'Pro' ? 'secondary' : 'default'}>
                                                {member.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{member.server}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
             </div>
        </section>

        {/* Discord Section */}
        <section id="discord" className="py-16 md:py-24">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">Join our community</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Discord Server
                    </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 space-y-4">
                         <h3 className="font-headline text-2xl uppercase mb-4">Latest Announcements</h3>
                        {announcements.map(ann => (
                            <div key={ann.id} className="border-b border-border pb-4 last:border-b-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Image src={ann.authorImageUrl || "https://picsum.photos/40/40"} width={40} height={40} alt="avatar" className="rounded-full" data-ai-hint="discord avatar" />
                                    <div>
                                        <span className="font-bold">{ann.author}</span>
                                        <span className="text-xs text-muted-foreground ml-2">{ann.date}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{ann.content}</p>
                            </div>
                        ))}
                    </div>
                     <div className="lg:col-span-1 flex flex-col items-center">
                        <Image src="https://picsum.photos/400/500" width={400} height={500} alt="Discord Character" className="mb-4 rounded-lg" data-ai-hint="fantasy knight character" />
                        <Button variant="secondary" size="lg" className="w-full">Join Discord</Button>
                    </div>
                </div>
             </div>
        </section>

         {/* About Us Section */}
        <section className="py-16 md:py-24 border-t border-border bg-card/50">
            <div className="container mx-auto px-4 text-center">
                 <p className="text-primary font-bold uppercase">Get to know us</p>
                <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                    About Our Clan
                </h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mt-4">
                    Founded on the principles of skill, strategy, and community, Fantom eSport has grown into a dominant force. We are a dedicated group of players who strive for excellence in every match and support each other to reach new heights.
                </p>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
