
'use client';

import { Header } from "@/components/header";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Gamepad2, ArrowRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Skeleton } from "@/components/ui/skeleton";


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
    rank: string;
    game: string;
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

interface Game {
  id: string;
  name: string;
  imageUrl: string;
  hint: string;
}

interface HeroImage {
  id: string;
  src: string;
  alt: string;
  hint: string;
}

const defaultHeroImages: HeroImage[] = [
  { id: 'default-1', src: 'https://i.pinimg.com/originals/20/c1/8c/20c18cfe73bc503ed8a0c5baa362ca2f.jpg', alt: 'Soldiers in a battlefield', hint: 'soldiers battlefield' },
  { id: 'default-2', src: 'https://i.pinimg.com/originals/fc/f6/4a/fcf64a71486e246ade88836fb1d60852.jpg', alt: 'Futuristic soldier overlooking a battlefield', hint: 'futuristic soldier' },
  { id: 'default-3', src: 'https://i.pinimg.com/originals/12/40/4e/12404e7f34f307f3a910df46ed225ba8.jpg', alt: 'Gamer in a neon-lit room', hint: 'gamer neon' },
  { id: 'default-4', src: 'https://i.pinimg.com/originals/57/00/02/570002ab712a71a1c96c81a26a4e1276.jpg', alt: 'Gamer with headphones in a dark room', hint: 'gamer headphones' },
];


export default function Home() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [heroImages, setHeroImages] = useState<HeroImage[]>(defaultHeroImages);
  const [loading, setLoading] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
        setLoading(true);
        setHeroLoading(true);

        try {
            const blogQuery = query(collection(db, "blogPosts"), orderBy("date", "desc"), limit(3));
            const rosterQuery = query(collection(db, "roster"), limit(5));
            const announcementsQuery = query(collection(db, "announcements"), orderBy("date", "desc"), limit(3));
            const gamesQuery = collection(db, "games");
            const heroImagesQuery = collection(db, "heroImages");

            const [
                blogSnapshot,
                rosterSnapshot,
                announcementsSnapshot,
                gamesSnapshot,
                heroImagesSnapshot,
            ] = await Promise.all([
                getDocs(blogQuery),
                getDocs(rosterQuery),
                getDocs(announcementsQuery),
                getDocs(gamesQuery),
                getDocs(heroImagesQuery),
            ]);

            const postsData: BlogPost[] = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
            const rosterData: RosterMember[] = rosterSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
            const announcementsData: Announcement[] = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
            const gamesData: Game[] = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
            const heroImagesData: HeroImage[] = heroImagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroImage));

            setBlogPosts(postsData);
            setRoster(rosterData);
            setAnnouncements(announcementsData);
            setGames(gamesData);
            if (heroImagesData.length > 0) {
              setHeroImages(heroImagesData);
            }
        } catch (error) {
            console.error("Error fetching homepage data:", error);
        } finally {
            setLoading(false);
            setHeroLoading(false);
        }
    };

    fetchAllData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="relative h-[75vh] w-full flex items-center justify-center text-center bg-black">
          <Header />
          {heroLoading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Carousel
                className="absolute inset-0 w-full h-full"
                plugins={[
                    Autoplay({
                        delay: 5000,
                        stopOnInteraction: false,
                    }),
                ]}
                opts={{ loop: true }}
            >
                <CarouselContent className="w-full h-full">
                    {heroImages.map((image, index) => (
                        <CarouselItem key={image.id} className="w-full h-full">
                            <div className="w-full h-full relative">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    sizes="100vw"
                                    className="object-cover w-full h-full opacity-40"
                                    data-ai-hint={image.hint}
                                    priority={index === 0}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
               <h1 className="text-8xl md:text-9xl font-headline font-black text-white tracking-wider uppercase" style={{ WebkitTextStroke: '1px hsl(var(--primary))', textShadow: '0 0 25px hsl(var(--primary))' }}>
                  Fantom
              </h1>
              <p className="mt-2 text-2xl text-muted-foreground uppercase font-bold tracking-widest">
                  Dominance is our creed
              </p>
          </div>
        </section>
        
        <div className="bg-background/80 backdrop-blur-sm">
            {/* Recent Articles Section */}
            <section id="blog" className="py-16 md:py-24">
                 <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold">OUR LATEST NEWS & UPDATES</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Recent Articles
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
            
            {/* Games Section */}
            <section id="games" className="py-16 md:py-24 border-t-2 border-primary/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold">WHERE WE COMPETE</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Our Battlegrounds
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {games.map((game) => (
                          <Card key={game.id} className="bg-card border-border overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300">
                                <div className="relative aspect-[3/4]">
                                    <Image
                                      src={game.imageUrl}
                                      alt={game.name}
                                      fill
                                      className="object-cover"
                                      data-ai-hint={game.hint}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4">
                                       <h3 className="text-lg md:text-xl font-headline font-bold uppercase text-white group-hover:text-primary transition-colors">
                                            {game.name}
                                        </h3>
                                    </div>
                                </div>
                          </Card>
                        ))}
                    </div>
                </div>
            </section>

             {/* Clan Section */}
            <section id="clan-roster" className="py-16 md:py-24 border-t-2 border-primary/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                         <p className="text-primary font-semibold">MEET OUR ELITE MEMBERS</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Clan Roster
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="md:col-span-1" id="recruitment" variant="glow">
                             <CardHeader>
                                <CardTitle className="text-primary uppercase">Join Our Ranks</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <p className="text-muted-foreground">Ready to compete with the best? We are always looking for skilled and dedicated players to join our cause. Apply now and become a part of the Fantom legacy.</p>
                                <Button variant="primary" className="mt-6">Recruitment</Button>
                             </CardContent>
                        </Card>
                        <Card className="bg-card md:col-span-2">
                             <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="flex items-center gap-2"><Users /> Active Roster</CardTitle>
                                    <CardDescription>The core of our strength. Meet the players who represent Fantom.</CardDescription>
                                </div>
                                <Link href="/roster">
                                    <Button variant="outline">View Full Roster <ArrowRight className="ml-2 h-4 w-4"/></Button>
                                </Link>
                             </CardHeader>
                             <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead className="hidden sm:table-cell">Game</TableHead>
                                            <TableHead className="hidden md:table-cell">Rank</TableHead>
                                            <TableHead>Role</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roster.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell className="font-medium">{member.name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{member.game}</TableCell>
                                                <TableCell className="hidden md:table-cell">{member.rank}</TableCell>
                                                <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
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
                        <p className="text-primary font-semibold">CONNECT WITH OUR COMMUNITY</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                            Discord Server
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        <Card className="md:col-span-2 bg-card">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Latest Announcements</CardTitle>
                                    <CardDescription>Stay updated with the latest news from our official Discord server.</CardDescription>
                                </div>
                                <Link href="/announcements">
                                    <Button variant="ghost">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {announcements.map((ann) => {
                                    if (!ann.author) return null;
                                    return (
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
                                    )
                                })}
                            </CardContent>
                        </Card>
                        <Card variant="glow" className="relative h-full min-h-[300px] flex flex-col items-center justify-center bg-card rounded-lg p-8 text-center">
                             <h3 className="text-2xl font-headline font-bold uppercase">Join the Conversation</h3>
                             <p className="text-muted-foreground mt-2 mb-6">Connect with members, get real-time updates, and be part of our thriving community.</p>
                             <Button variant="primary" size="lg">Join Our Discord</Button>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* About Section */}
            <section id="about" className="py-16 md:py-24 border-t-2 border-primary/20">
                 <div className="container mx-auto px-4 text-center">
                    <p className="text-primary font-semibold">FORGED IN BATTLE</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                        About Our Clan
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-3xl mx-auto">
                        Fantom eSport was founded by a group of passionate gamers dedicated to achieving excellence. We compete at the highest level, value teamwork, and foster a community built on respect and skill.
                    </p>
                    <Link href="/about" className="mt-6 inline-block">
                        <Button variant="primary">Learn Our Story</Button>
                    </Link>
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
