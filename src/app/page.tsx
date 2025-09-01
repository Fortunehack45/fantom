'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { ArrowRight, ChevronRight, Dot } from "lucide-react";
import Link from "next/link";
import { DoomIcon } from '@/components/icons';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  hint: string;
  category: string;
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
}

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
                 title: doc.data().title,
                 content: doc.data().content,
                 hint: "fantasy character art",
                 category: "News"
            }));
            setBlogPosts(postsData);
        };
        const fetchRoster = async () => {
            const q = query(collection(db, "roster"), limit(5));
            const querySnapshot = await getDocs(q);
            const rosterData: RosterMember[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
            setRoster(rosterData);
        };
        const fetchAnnouncements = async () => {
            const q = query(collection(db, "announcements"), limit(3));
            const querySnapshot = await getDocs(q);
            const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                date: "06/06/2022 - 11:26 AM CET"
            } as Announcement));
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
        <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center text-center text-white overflow-hidden">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Fantasy background"
            fill
            className="object-cover object-top z-0"
            data-ai-hint="dark fantasy landscape"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
           <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10" />
          <div className="relative z-20 flex flex-col items-center">
            <DoomIcon className="w-96 h-auto" />
             <p className="font-headline text-2xl uppercase tracking-widest text-shadow">Potentia Invicta</p>
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
        <section className="py-12 container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-8">
                 <div className="bg-card border border-border p-4 rounded-md flex items-center gap-4">
                     <Dot className="text-green-500 w-12 h-12" />
                     <div>
                         <h3 className="font-headline text-lg">L2Eve x1 Interlude Retail Like - [48/32/2091]</h3>
                         <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...</p>
                         <div className="flex items-center gap-4 mt-2">
                             <Button variant="secondary" size="sm">Discord</Button>
                             <span className="text-xs text-muted-foreground">https://private-server.com/l2eve-x1</span>
                         </div>
                     </div>
                      <ChevronRight className="ml-auto text-muted-foreground" />
                 </div>
                 <div className="bg-card border border-border p-4 rounded-md flex items-center gap-4">
                     <Dot className="text-green-500 w-12 h-12" />
                     <div>
                         <h3 className="font-headline text-lg">Moon-Land Interlude Remastered - 04/11</h3>
                         <p className="text-sm text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...</p>
                         <div className="flex items-center gap-4 mt-2">
                             <Button variant="secondary" size="sm">Discord</Button>
                             <span className="text-xs text-muted-foreground">https://private-server.com/moon-land</span>
                         </div>
                     </div>
                     <ChevronRight className="ml-auto text-muted-foreground" />
                 </div>
             </div>
        </section>

        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">Read our most recent blog posts</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Blog - Recent Articles
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                        <Card className="bg-card border-border overflow-hidden flex flex-col h-full hover:border-primary transition-colors group">
                            <div className="relative">
                                <Image
                                src={`https://picsum.photos/400/250?q=${post.id}`}
                                alt="Blog Post Image"
                                width={400}
                                height={250}
                                className="w-full h-48 object-cover"
                                data-ai-hint={post.hint}
                                />
                                 <Badge className="absolute top-2 left-2" variant="primary">{post.category}</Badge>
                            </div>
                            <CardContent className="p-4 flex-grow flex flex-col">
                                <h3 className="text-lg font-headline mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
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
        <section id="roster" className="py-16 md:py-24">
             <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">We are the best of the best, join us!</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Our Clan - Doom
                    </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 bg-card border border-border rounded-lg p-6 flex flex-col items-center text-center">
                        <h3 className="font-headline text-2xl uppercase mb-4">Lorem Ipsum Dolor</h3>
                        <p className="text-muted-foreground mb-6">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        </p>
                         <Button variant="primary" size="lg">Recruitment</Button>
                    </div>
                    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline text-2xl uppercase">Clan Roster</h3>
                             <div>
                                 <Button variant="ghost" size="sm">Server 1</Button>
                                 <Button variant="ghost" size="sm" className="text-muted-foreground">Server 2</Button>
                             </div>
                        </div>
                        <Table>
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
                                        <TableCell className="text-muted-foreground">Moderator</TableCell>
                                        <TableCell className="text-muted-foreground">06/06/2022 - 11:26 AM CET</TableCell>
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
                    <p className="text-primary font-bold uppercase">Join to our discord server</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                        Discord Server
                    </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 space-y-4">
                         <h3 className="font-headline text-2xl uppercase mb-4">Discord Announcements</h3>
                        {announcements.map(ann => (
                            <div key={ann.id} className="border-b border-border pb-4 last:border-b-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Image src="https://picsum.photos/40/40" width={40} height={40} alt="avatar" className="rounded-full" data-ai-hint="discord avatar" />
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
                        <Image src="https://picsum.photos/400/500" width={400} height={500} alt="Discord Character" className="mb-4" data-ai-hint="fantasy knight character" />
                        <Button variant="secondary" size="lg" className="w-full">Join Discord</Button>
                    </div>
                </div>
             </div>
        </section>

         {/* About Us Section */}
        <section className="py-16 md:py-24 border-t border-border">
            <div className="container mx-auto px-4 text-center">
                 <p className="text-primary font-bold uppercase">We are the best L2 players</p>
                <h2 className="text-4xl md:text-5xl font-headline font-black uppercase">
                    About Our Clan
                </h2>
                <p className="max-w-3xl mx-auto text-muted-foreground mt-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis. 
                </p>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
