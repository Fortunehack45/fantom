'use client';

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Users } from "lucide-react";

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
    { id: '6',name: 'Apex Legends', memberCount: 5, logoUrl: '/icons/apex.svg' },
];

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section id="hero" className="relative h-[50vh] md:h-[60vh] flex items-center justify-center text-center">
            <div className="absolute inset-0">
                <Image
                    src="https://picsum.photos/1920/1080?random=cyberpunk"
                    alt="Cyberpunk cityscape"
                    fill
                    className="object-cover"
                    data-ai-hint="cyberpunk city neon"
                    priority
                />
                <div className="absolute inset-0 bg-black/60 bg-gradient-to-b from-black/20 via-transparent to-background" />
            </div>
            <div className="relative z-10 container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-headline font-bold uppercase text-white tracking-wider" style={{ textShadow: '0 0 15px hsl(var(--primary))' }}>
                        The Next Generation
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-muted-foreground uppercase max-w-2xl mx-auto">
                       You can download a copy of the data saved in your google account.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button variant="primary" size="lg" className="btn-primary-glow">
                          <Play className="mr-2" />
                          Play Now
                      </Button>
                      <Button variant="outline" size="lg" className="btn-secondary-glow">
                          Explore More
                      </Button>
                    </div>
                </div>
            </div>
             <Footer />
        </section>
        
        <div className="bg-background">
            <section id="game" className="py-16 md:py-24 border-y-2 border-primary/20">
                 <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative aspect-video">
                            <Image src="https://picsum.photos/600/400?random=gameplay" alt="Gameplay" fill className="object-cover rounded-lg" data-ai-hint="futuristic game" />
                        </div>
                        <div>
                            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">The Game</h2>
                            <p className="mt-4 text-muted-foreground">Dive into a persistent online world where every action matters. Form alliances, conquer territories, and write your legend in the annals of ALICA. Experience tactical combat, deep customization, and a player-driven economy.</p>
                            <Button variant="primary" className="mt-6">Learn More</Button>
                        </div>
                    </div>
                 </div>
            </section>

            {/* Teams Section */}
            <section id="teams" className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-headline font-black uppercase text-white">
                            Meet Our Teams
                        </h2>
                        <p className="text-primary font-bold text-xl">#ALICAWIN</p>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {teams.map((team) => (
                            <Card key={team.id} className="bg-muted/20 border-border p-4 rounded-lg flex flex-col items-center justify-center text-center group hover:bg-primary/10 hover:border-primary transition-colors">
                               <div className="relative w-12 h-12 mb-3 grayscale group-hover:grayscale-0 transition-all">
                                <Image src={team.logoUrl} alt={`${team.name} logo`} fill className="object-contain" />
                               </div>
                               <h3 className="font-bold uppercase text-sm text-white">{team.name}</h3>
                               <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {team.memberCount} Members</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            <section id="marketplace" className="py-16 md:py-24 border-y-2 border-primary/20">
                 <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                         <div className="order-2 md:order-1">
                            <h2 className="text-4xl md:text-5xl font-headline font-bold uppercase text-white">
                                Marketplace
                            </h2>
                             <p className="mt-4 text-muted-foreground max-w-lg">
                                Trade unique digital assets, from powerful in-game items to limited edition skins. Our marketplace is secure, transparent, and driven by the community.
                            </p>
                             <Button variant="primary" className="mt-6">
                                Go to Marketplace
                            </Button>
                        </div>
                        <div className="relative aspect-video order-1 md:order-2">
                            <Image src="https://picsum.photos/600/400?random=marketplace" alt="Marketplace" fill className="object-cover rounded-lg" data-ai-hint="digital assets crypto" />
                        </div>
                    </div>
                 </div>
            </section>
        </div>
      </main>
    </div>
  );
}
