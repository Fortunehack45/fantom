
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Shield, Star, Users } from 'lucide-react';
import Image from 'next/image';

interface RosterMember {
    id: string;
    name: string;
    rank: string;
    game: string;
    role: string;
    server: string;
    avatarUrl?: string;
}

const roleIcons: { [key: string]: React.ReactNode } = {
    'Legendary': <Star className="h-4 w-4 text-yellow-400" />,
    'Pro': <Shield className="h-4 w-4 text-blue-400" />,
    'New Member': <Users className="h-4 w-4 text-green-400" />,
};

export default function RosterPage() {
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoster = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "roster"));
        const rosterData: RosterMember[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
        setRoster(rosterData);
        setLoading(false);
    };

    fetchRoster();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Fantom eSport Roster
            </h1>
            <p className="text-muted-foreground mt-2">The elite players who represent our clan across multiple battlegrounds.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
                [...Array(8)].map((_, i) => (
                    <Card key={i} className="bg-card animate-pulse">
                        <CardHeader className="p-4">
                            <div className="h-8 w-3/4 bg-muted rounded"></div>
                            <div className="h-4 w-1/2 bg-muted rounded mt-1"></div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                             <div className="h-4 w-full bg-muted rounded"></div>
                             <div className="h-4 w-full bg-muted rounded"></div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                roster.map((member) => (
                    <Card key={member.id} className="bg-card border-border overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary/5">
                            <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{member.name}</CardTitle>
                                <CardDescription className="text-sm">{member.server}</CardDescription>
                            </div>
                            <div className="relative h-12 w-12">
                                <Image src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} width={150} height={150} className="rounded-full object-cover border-2 border-primary/50"/>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Gamepad2 className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">Game:</span>
                                    <span className="text-muted-foreground">{member.game}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span className="font-semibold">Rank:</span>
                                    <span className="text-muted-foreground">{member.rank}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                     <span className="font-semibold">Role:</span>
                                     <Badge variant="secondary" className="flex items-center gap-1">
                                        {roleIcons[member.role] || null}
                                        {member.role}
                                     </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
      </main>
    </div>
  );
}

    