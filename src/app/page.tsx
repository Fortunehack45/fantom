'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, Dices, PlayCircle, Swords, Users } from "lucide-react";
import Link from "next/link";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface TeamMember {
  name: string;
  role: string;
  avatarUrl: string;
  hint: string;
}

export default function Home() {
  
  const teamMembers: TeamMember[] = [
    { name: "Crypto Guru", role: "Founder", avatarUrl: "https://picsum.photos/150/150?random=1", hint: "male avatar" },
    { name: "Davinci Jeremie", role: "Media Advisor", avatarUrl: "https://picsum.photos/150/150?random=2", hint: "male avatar" },
    { name: "The Moon Carl", role: "Advisor", avatarUrl: "https://picsum.photos/150/150?random=3", hint: "male avatar" },
    { name: "Alex Meurer", role: "AD Advisor", avatarUrl: "https://picsum.photos/150/150?random=4", hint: "male avatar" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] md:h-[90vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="The Next Generation Background"
            fill
            className="object-cover"
            data-ai-hint="dark city night"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-4 flex flex-col items-center animate-in fade-in duration-1000">
            <h1 className="text-5xl md:text-8xl font-headline font-black mb-4 tracking-wider uppercase">
              The Next<br/>Generation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8">
              You can download a copy of the data saved in your Google account.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg">Play Now</Button>
              <Button variant="outline" size="lg">Explore More</Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <p className="text-sm uppercase text-primary font-bold">About</p>
                        <h2 className="text-3xl md:text-5xl font-headline font-bold mb-4 uppercase">The Magiccraft</h2>
                        <p className="text-muted-foreground mb-8">
                           MagicCraft is a PvP war game. Level up with your friends, fight each other, earn real money through SMCRT cryptocurrency in the game. When you die you can drop real money and items which makes the stakes more intense. The first real PvP castle siege play-to-earn game.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Button variant="primary">Beta Testing</Button>
                            <Button variant="secondary">Marketplace</Button>
                            <Button variant="ghost">Buy SMCRT</Button>
                             <Button variant="ghost">Whitepaper</Button>
                            <Button variant="ghost">Become a Partner</Button>
                        </div>
                    </div>
                    <div className="w-full">
                       <Carousel opts={{
                          align: "start",
                          loop: true,
                        }}>
                          <CarouselContent>
                            <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                                <Card className="bg-transparent border-primary/50 border-2 rounded-xl overflow-hidden group">
                                  <CardContent className="p-0 relative">
                                    <Image src="https://picsum.photos/400/500?random=1" width={400} height={500} alt="Mint NFT" className="w-full h-auto" data-ai-hint="female character concept" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                      <h3 className="font-bold text-lg text-white">MINT NFT</h3>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ArrowRight className="w-6 h-6" />
                                    </div>
                                  </CardContent>
                                </Card>
                            </CarouselItem>
                             <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                                <Card className="bg-transparent border-border rounded-xl overflow-hidden group">
                                  <CardContent className="p-0 relative">
                                    <Image src="https://picsum.photos/400/500?random=2" width={400} height={500} alt="NCRT Staking" className="w-full h-auto" data-ai-hint="female character concept" />
                                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                      <h3 className="font-bold text-lg text-white">NCRT STAKING</h3>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-primary/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ArrowRight className="w-6 h-6" />
                                    </div>
                                  </CardContent>
                                </Card>
                            </CarouselItem>
                            <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                                <Card className="bg-transparent border-border rounded-xl overflow-hidden group">
                                  <CardContent className="p-0 relative">
                                    <Image src="https://picsum.photos/400/500?random=3" width={400} height={500} alt="Character 3" className="w-full h-auto" data-ai-hint="female character concept" />
                                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                      <h3 className="font-bold text-lg text-white">MINT NFT</h3>
                                    </div>
                                     <div className="absolute top-4 right-4 bg-primary/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <ArrowRight className="w-6 h-6" />
                                    </div>
                                  </CardContent>
                                </Card>
                            </CarouselItem>
                          </CarouselContent>
                          <div className="hidden md:block">
                            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
                          </div>
                        </Carousel>
                    </div>
                </div>
            </div>
        </section>


        {/* Game Play Section */}
        <section id="gameplay" className="py-16 md:py-24 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase">
                Game Play
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {['BATHOS', 'BATHOS', 'KONGKEY', 'DESTROID'].map((name, i) => (
                 <Card key={i} className="bg-card border-2 border-primary/30 rounded-xl overflow-hidden group text-white relative">
                  <Image src={`https://picsum.photos/400/500?random=${10+i}`} width={400} height={500} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint="gameplay screenshot" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-4">
                     <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent">
                       <h3 className="font-bold text-xl uppercase tracking-widest">{name}</h3>
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="w-20 h-20 text-white/80" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold uppercase">
                        Meet Our Team
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {teamMembers.map((member) => (
                    <div key={member.name} className="text-center flex flex-col items-center">
                        <div className="relative mb-4">
                           <Image src={member.avatarUrl} width={150} height={150} alt={member.name} className="rounded-full border-4 border-primary/50" data-ai-hint={member.hint}/>
                        </div>
                        <h3 className="text-xl font-bold uppercase">{member.name}</h3>
                        <p className="text-muted-foreground">{member.role}</p>
                    </div>
                  ))}
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
