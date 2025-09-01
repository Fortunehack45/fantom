'use client';

import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

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

interface RosterMember {
    id: string;
    name: string;
    role: string;
    server: string;
}

interface Announcement {
    id: string;
    author: string;
    authorImageUrl?: string;
    content: string;
    date: any;
}


export default function Home() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
        const q = query(collection(db, "blogPosts"), orderBy("date", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const postsData: BlogPost[] = querySnapshot.docs.map(doc => ({
             id: doc.id,
             ...doc.data(),
        } as BlogPost));
        setBlogPosts(postsData);
    };

    const fetchRoster = async () => {
        const querySnapshot = await getDocs(collection(db, "roster"));
        const rosterData: RosterMember[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
        setRoster(rosterData);
    };
    
    const fetchAnnouncements = async () => {
        const q = query(collection(db, "announcements"), limit(3));
        const querySnapshot = await getDocs(q);
        const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(announcementsData);
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
        <section id="hero" className="relative h-[60vh] flex items-center justify-center text-center bg-black">
            <div className="absolute inset-0">
                <Image
                    src="https://picsum.photos/1920/1080?random=fantasy-character"
                    alt="Fantasy character"
                    fill
                    className="object-cover opacity-30"
                    data-ai-hint="fantasy character art"
                    priority
                />
            </div>
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
                 <h1 className="text-8xl md:text-9xl font-headline font-black text-white tracking-wider" style={{ WebkitTextStroke: '1px hsl(var(--primary))', textShadow: '0 0 25px hsl(var(--primary))' }}>
                    FANTOM
                </h1>
                <p className="mt-2 text-2xl text-muted-foreground uppercase font-bold tracking-widest">
                    Potentia Invicta
                </p>
            </div>
        </section>
        
        <div className="bg-background/80 backdrop-blur-sm">
            {/* Recent Articles Section */}
            <section id="blog" className="py-16 md:py-24">
                 <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold">READ OUR MOST RECENT BLOG POSTS</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Blog - Recent Articles
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    <div className="text-center mt-12">
                        <Link href="/blog">
                            <Button variant="primary">View All Posts</Button>
                        </Link>
                    </div>
                 </div>
            </section>

             {/* Clan Section */}
            <section id="clan-roster" className="py-16 md:py-24 border-t-2 border-primary/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                         <p className="text-primary font-semibold">WE ARE THE BEST, JOIN US!</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Our Clan - Fantom
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-card md:col-span-1" id="recruitment">
                             <CardHeader>
                                <CardTitle className="text-primary uppercase">Lorem Ipsum Dolor</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida.</p>
                                <Button variant="primary" className="mt-6">Recruitment</Button>
                             </CardContent>
                        </Card>
                        <Card className="bg-card md:col-span-2">
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Users /> Clan Roster</CardTitle>
                                <CardDescription>Lorem ipsum dolor sit amet, consectetur adipiscing elit</CardDescription>
                             </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Server</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roster.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-medium">{member.name}</TableCell>
                                                <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                                <TableCell>{member.server}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Discord Section */}
            <section id="discord" className="py-16 md:py-24 border-t-2 border-primary/20">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <p className="text-primary font-semibold">JOIN TO OUT DISCORD SERVER</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Discord Server
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        <Card className="md:col-span-2 bg-card">
                            <CardHeader>
                                <CardTitle>Discord Announcements</CardTitle>
                                <CardDescription>Browse the latest announcements from our discord server</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {announcements.map((ann) => (
                                    <div key={ann.id} className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarImage src={ann.authorImageUrl || `https://picsum.photos/40/40?random=${ann.id}`} />
                                            <AvatarFallback>{ann.author.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-bold text-primary">{ann.author}</p>
                                                <p className="text-xs text-muted-foreground">
                                                     {ann.date ? format(new Date(ann.date.seconds * 1000), 'dd/MM/yyyy - hh:mm a') : ''}
                                                </p>
                                            </div>
                                            <p className="text-sm text-foreground/80">{ann.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <div className="relative h-full min-h-[300px] flex flex-col items-center justify-center">
                             <Image src="https://picsum.photos/400/600?random=fantasy-warrior" alt="Fantasy Warrior" fill className="object-cover rounded-lg opacity-80" data-ai-hint="fantasy warrior art" />
                             <div className="relative z-10 flex flex-col items-center">
                                 <Button variant="primary" size="lg">Join Discord</Button>
                             </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* About Section */}
            <section id="about" className="py-16 md:py-24 border-t-2 border-primary/20">
                 <div className="container mx-auto px-4 text-center">
                    <p className="text-primary font-semibold">WE ARE THE BEST L2 PLAYERS</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                        About our Clan
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. 
                    </p>
                 </div>
            </section>
        </div>
      </main>
       <footer className="py-6 border-t border-primary/20">
            <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                <p>©{new Date().getFullYear()} Fantom eSport - All rights reserved.</p>
            </div>
      </footer>
    </div>
  );
}
