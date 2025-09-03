
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Chat {
    id: string;
    users: string[]; // UIDs of participants
    userAvatars: { [key: string]: string };
    userNames: { [key: string]: string };
    lastMessage?: string;
    lastMessageTimestamp?: any;
}

export default function MessagesPage() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                router.push('/admin/login');
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef,
            where('users', 'array-contains', currentUser.uid),
            orderBy('lastMessageTimestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Chat));
            setChats(chatsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chats:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getOtherParticipant = (chat: Chat) => {
        if (!currentUser) return null;
        const otherUserId = chat.users.find(uid => uid !== currentUser.uid);
        if (!otherUserId) return null;
        return {
            uid: otherUserId,
            name: chat.userNames[otherUserId],
            avatar: chat.userAvatars[otherUserId],
        };
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <div className="p-6">
                            <h1 className="text-2xl font-headline font-bold">Your Conversations</h1>
                        </div>
                        <div className="border-t">
                            {loading ? (
                                <div className="p-6 space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2 flex-grow">
                                                <Skeleton className="h-4 w-1/3" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : chats.length === 0 ? (
                                <div className="text-center p-12 text-muted-foreground">
                                    <MessageSquareText className="h-12 w-12 mx-auto mb-4" />
                                    <p className="font-semibold">No conversations yet.</p>
                                    <p className="text-sm">Start a new chat from a user's profile page.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-border">
                                    {chats.map(chat => {
                                        const otherUser = getOtherParticipant(chat);
                                        if (!otherUser) return null;

                                        return (
                                            <li key={chat.id}
                                                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/messages/${chat.id}`)}>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12">
                                                        <AvatarImage src={otherUser.avatar} />
                                                        <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-grow overflow-hidden">
                                                        <div className="flex justify-between items-baseline">
                                                            <p className="font-bold truncate">{otherUser.name}</p>
                                                            {chat.lastMessageTimestamp && (
                                                                <p className="text-xs text-muted-foreground shrink-0 ml-2">
                                                                    {formatDistanceToNow(new Date(chat.lastMessageTimestamp.seconds * 1000), { addSuffix: true })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || 'No messages yet'}</p>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
