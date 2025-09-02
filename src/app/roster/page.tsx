
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Shield, Star, Users, Crown, Swords, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/footer';

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
    'Legendary': <Crown className="h-4 w-4 text-yellow-400" />,
    'Pro': <Swords className="h-4 w-4 text-red-400" />,
    'Strategist': <BrainCircuit className="h-4 w-4 text-blue-400" />,
    'Member': <Users className="h-4 w-4 text-green-400" />,
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
        // Sort roster alphabetically by name
        rosterData.sort((a, b) => a.name.localeCompare(b.name));
        setRoster(rosterData);
        setLoading(false);
    };

    fetchRoster();
  }, []);

  const RosterSkeleton = () => (
    <Card className="bg-card animate-pulse overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary/5">
            <div className="space-y-1.5">
                <Skeleton className="h-6 w-32 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-14 w-14 rounded-full" />
        </CardHeader>
        <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-6 w-28 rounded-md" />
            </div>
        </CardContent>
    </Card>
  );

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
                [...Array(8)].map((_, i) => <RosterSkeleton key={i} />)
            ) : (
                roster.map((member) => (
                    <Card key={member.id} className="bg-card border-border overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-primary/20 flex flex-col" variant="glowOnHover">
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-primary/5">
                            <div>
                                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{member.name}</CardTitle>
                                <CardDescription className="text-sm">{member.server}</CardDescription>
                            </div>
                            <div className="relative h-14 w-14 shrink-0">
                                <Image src={member.avatarUrl || `https://i.pravatar.cc/150?u=${member.id}`} alt={member.name} fill sizes="56px" className="rounded-full object-cover border-2 border-primary/50"/>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Gamepad2 className="h-4 w-4 text-primary shrink-0" />
                                    <span className="font-semibold">Game:</span>
                                    <span className="text-muted-foreground truncate">{member.game}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary shrink-0" />
                                    <span className="font-semibold">Rank:</span>
                                    <span className="text-muted-foreground truncate">{member.rank}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-primary shrink-0" />
                                     <span className="font-semibold">Role:</span>
                                     <Badge variant="secondary" className="flex items-center gap-1.5">
                                        {roleIcons[member.role] || <Users className="h-4 w-4 text-gray-400" />}
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
      <Footer />
    </div>
  );
}
