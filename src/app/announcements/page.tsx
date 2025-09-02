
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Footer } from '@/components/footer';
import { MessageSquare } from 'lucide-react';

interface Announcement {
    id: string;
    author: string;
    authorImageUrl?: string;
    content: string;
    date: any;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
        setLoading(true);
        const q = query(collection(db, "announcements"), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as Announcement));
        setAnnouncements(announcementsData);
        setLoading(false);
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Announcements
            </h1>
            <p className="text-muted-foreground mt-2">The latest news & updates from our Discord server.</p>
        </div>
        
        {loading ? (
            <div className="space-y-6 max-w-3xl mx-auto">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="bg-card p-4 animate-pulse">
                         <div className="flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-4 w-1/4 bg-muted rounded"></div>
                                <div className="h-4 w-full bg-muted rounded"></div>
                                <div className="h-4 w-3/4 bg-muted rounded"></div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        ) : announcements.length === 0 ? (
            <div className="text-center py-16">
                <div className="mx-auto bg-primary/10 rounded-full h-24 w-24 flex items-center justify-center">
                    <MessageSquare className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-headline font-bold">No Announcements Yet</h2>
                <p className="mt-2 text-muted-foreground">Check back later for the latest updates!</p>
            </div>
        ) : (
             <div className="space-y-6 max-w-3xl mx-auto">
                {announcements.map((ann) => (
                    <Card key={ann.id} className="bg-card p-4">
                         <CardContent className="p-0">
                            <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={ann.authorImageUrl || `https://picsum.photos/40/40?random=${ann.id}`} />
                                    <AvatarFallback>{ann.author.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-bold text-primary">{ann.author}</p>
                                        <p className="text-xs text-muted-foreground">
                                             {ann.date ? format(new Date(ann.date.seconds * 1000), 'MMM d, yyyy - hh:mm a') : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{ann.content}</p>
                                </div>
                            </div>
                         </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
