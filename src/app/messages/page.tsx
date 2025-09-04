
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquareText } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import Link from 'next/link';

interface ChatListItem {
    id: string;
    users: string[]; // UIDs of participants
    userAvatars: { [key: string]: string };
    userNames: { [key: string]: string };
    lastMessage?: string;
    lastMessageTimestamp?: any;
}

const ADMIN_EMAIL = 'fortunedomination@gmail.com';

const ChatList = ({ currentUser, isAdmin }: { currentUser: User | null; isAdmin: boolean; }) => {
    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) {
            setChats([]);
            setLoading(false);
            return;
        }
        setLoading(true);

        const chatsRef = collection(db, 'chats');
        const q = isAdmin
            ? query(chatsRef, orderBy('lastMessageTimestamp', 'desc'))
            : query(collection(db, "chats"), where('users', 'array-contains', currentUser.uid), orderBy('lastMessageTimestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const chatsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatListItem));
            setChats(chatsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching chats:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, isAdmin]);

    const getParticipantDetails = (chat: ChatListItem) => {
        if (!currentUser) return null;
        if (isAdmin) {
             const user1 = chat.users[0];
             const user2 = chat.users[1];
             const name1 = chat.userNames?.[user1] || 'User';
             const name2 = chat.userNames?.[user2] || 'User';
             return {
                 name: `${name1} & ${name2}`,
                 avatar: chat.userAvatars?.[user1] || '',
                 otherUserId: null
             }
        }
        const otherUserId = chat.users.find(uid => uid !== currentUser.uid);
        if (!otherUserId) return null;
        return {
            name: chat.userNames?.[otherUserId] || 'Unknown User',
            avatar: chat.userAvatars?.[otherUserId] || '',
            otherUserId: otherUserId
        };
    };

    if (loading) {
        return (
            <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    if (chats.length === 0) {
        return (
            <div className="p-8 text-center text-muted-foreground flex-grow flex flex-col items-center justify-center">
                <MessageSquareText className="mx-auto h-10 w-10 mb-2"/>
                <p className="font-semibold">No chats yet.</p>
                <p className="text-sm">Start a chat from a user's profile.</p>
            </div>
        )
    }

    return (
        <nav className="p-2 space-y-1">
            {chats.map(chat => {
                const details = getParticipantDetails(chat);
                if (!details) return null;

                return (
                    <Link
                        key={chat.id}
                        href={`/messages/${chat.id}`}
                        className='flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50'
                    >
                        <Avatar className="h-12 w-12 border-2 border-transparent">
                            <AvatarImage src={details.avatar} />
                            <AvatarFallback>{details.name?.charAt(0) ?? '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <div className="flex justify-between items-baseline">
                                <p className="font-bold truncate">{details.name}</p>
                                {chat.lastMessageTimestamp && (
                                    <p className="text-xs text-muted-foreground shrink-0 ml-2">
                                        {formatDistanceToNowStrict(new Date(chat.lastMessageTimestamp.seconds * 1000))}
                                    </p>
                                )}
                            </div>
                            <p className='text-sm truncate text-muted-foreground'>
                                {chat.lastMessage || 'No messages yet'}
                            </p>
                        </div>
                    </Link>
                )
            })}
        </nav>
    )
}

const EmptyState = () => (
    <div className="h-full flex-col items-center justify-center text-center text-muted-foreground hidden md:flex flex-grow">
        <MessageSquareText className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-bold">Select a conversation</h2>
        <p>Choose a chat from the list to start messaging.</p>
    </div>
);


export default function MessagesPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setIsAdmin(user.email === ADMIN_EMAIL);
            } else {
                router.push('/admin/login');
                setCurrentUser(null);
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-0 md:px-4 py-0 md:py-8 flex h-[calc(100vh-10rem)]">
                 <div className="flex flex-grow bg-card border border-border rounded-none md:rounded-lg overflow-hidden">
                    <aside className="h-full w-full md:w-1/3 lg:w-1/4 flex flex-col border-r border-border">
                        <div className="p-4 border-b border-border">
                            <h1 className="text-xl font-headline font-bold">Conversations</h1>
                            {isAdmin && <p className="text-xs text-muted-foreground">Admin View</p>}
                        </div>
                        <div className="flex-grow overflow-y-auto">
                            <ChatList currentUser={currentUser} isAdmin={isAdmin} />
                        </div>
                    </aside>
                    <EmptyState />
                 </div>
            </main>
            <Footer />
        </div>
    );
}
