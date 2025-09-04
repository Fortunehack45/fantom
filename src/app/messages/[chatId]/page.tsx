
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { collection, doc, onSnapshot, addDoc, serverTimestamp, query, orderBy, updateDoc, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, MessageSquareText, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNowStrict } from 'date-fns';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: any;
    imageUrl?: string;
    videoUrl?: string;
}

interface ChatListItem {
    id: string;
    users: string[];
    userAvatars: { [key: string]: string };
    userNames: { [key: string]: string };
    lastMessage?: string;
    lastMessageTimestamp?: any;
}

interface ChatDetails extends ChatListItem {
    // any additional details needed for a single chat view
}

const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
const isVideo = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);


const ChatList = ({ currentUser, activeChatId, isAdmin }: { currentUser: User | null; activeChatId: string; isAdmin: boolean; }) => {
    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) {
            setChats([]);
            setLoading(false);
            return;
        };
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
                 avatar: chat.userAvatars?.[user1] || '', // show first user's avatar for group
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

    return (
         <aside className="h-full w-full md:w-1/3 lg:w-1/4 flex-col border-r border-border hidden md:flex">
            <div className="p-4 border-b border-border">
                <h1 className="text-xl font-headline font-bold">Conversations</h1>
            </div>
            <div className="flex-grow overflow-y-auto">
                 {loading ? (
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
                 ) : chats.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <MessageSquareText className="mx-auto h-10 w-10 mb-2"/>
                        <p className="font-semibold">No chats yet.</p>
                        <p className="text-sm">Start a chat from a user's profile.</p>
                    </div>
                 ) : (
                    <nav className="p-2">
                        {chats.map(chat => {
                            const details = getParticipantDetails(chat);
                            if (!details) return null;
                            const isActive = chat.id === activeChatId;

                            return (
                                <Link
                                    key={chat.id}
                                    href={`/messages/${chat.id}`}
                                    className={
                                        `flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                                            isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                                        }`
                                    }
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
                                        <p className={`text-sm truncate ${isActive ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                                            {chat.lastMessage || 'No messages yet'}
                                        </p>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                 )}
            </div>
        </aside>
    )
}

const ChatView = ({ chatId }: { chatId: string }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatDetails, setChatDetails] = useState<ChatDetails | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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
        if (!chatId || !currentUser) {
            setMessages([]);
            setChatDetails(null);
            setLoading(!currentUser);
            return;
        }

        setLoading(true);

        const chatDocRef = doc(db, 'chats', chatId);
        const unsubscribeChat = onSnapshot(chatDocRef, (doc) => {
            if (doc.exists()) {
                const chatData = { id: doc.id, ...doc.data() } as ChatDetails;
                // Admin check is not needed here as rules should handle it.
                // But as a fallback, we check if user is a participant.
                const isAdmin = currentUser.email === 'fortunedomination@gmail.com';
                if (!chatData.users.includes(currentUser.uid) && !isAdmin) {
                    router.push('/messages');
                    return;
                }
                setChatDetails(chatData);
            } else {
                router.push('/messages');
            }
        }, (error) => {
            console.error("Chat details snapshot error:", error);
            router.push('/messages');
        });

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
            setLoading(false);
             setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
        }, (error) => {
            console.error("Messages snapshot error:", error);
            setLoading(false);
        });

        return () => {
            unsubscribeChat();
            unsubscribeMessages();
        };
    }, [chatId, currentUser, router]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser || !chatId) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        
        let messagePayload: any = { text: newMessage };
        let lastMessageText = newMessage;

        try {
            const url = new URL(newMessage.trim());
            if (isImage(url.pathname)) {
                messagePayload = { imageUrl: url.href, text: '' };
                lastMessageText = 'Image';
            } else if (isVideo(url.pathname)) {
                messagePayload = { videoUrl: url.href, text: '' };
                lastMessageText = 'Video';
            }
        } catch (_) {
            // Not a valid URL, treat as plain text
        }
        
        await addDoc(messagesRef, {
            ...messagePayload,
            senderId: currentUser.uid,
            timestamp: serverTimestamp(),
        });

        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
            lastMessage: lastMessageText,
            lastMessageTimestamp: serverTimestamp(),
        });
        
        setNewMessage('');
    };

    const getOtherUserDetails = () => {
        if (!chatDetails || !currentUser) return { name: 'Loading...', avatar: '' };
        
        const isAdmin = currentUser.email === 'fortunedomination@gmail.com';

        if (isAdmin && chatDetails.users.length === 2) {
             const otherUser1 = chatDetails.users[0];
             const otherUser2 = chatDetails.users[1];
             const name1 = chatDetails.userNames?.[otherUser1] || 'User';
             const name2 = chatDetails.userNames?.[otherUser2] || 'User';
            return {
                name: `${name1} & ${name2}`,
                avatar: chatDetails.userAvatars?.[otherUser1] || '',
            }
        }
        
        const otherUserId = chatDetails.users.find(uid => uid !== currentUser.uid);
        if (!otherUserId) return { name: 'Conversation', avatar: ''};

        return {
            name: chatDetails.userNames?.[otherUserId] || 'Unknown User',
            avatar: chatDetails.userAvatars?.[otherUserId] || '',
        };
    };
    
    const { name: otherUserName, avatar: otherUserAvatar } = getOtherUserDetails();
    
     if (loading) {
        return (
            <div className="flex flex-1 flex-col h-full">
                <div className="flex items-center p-3 border-b border-border bg-muted/50">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4 space-y-1">
                        <Skeleton className="h-5 w-32" />
                    </div>
                </div>
                <div className="flex-grow p-4 space-y-4">
                    <Skeleton className="h-10 w-3/5 rounded-lg" />
                    <Skeleton className="h-10 w-3/5 ml-auto rounded-lg" />
                    <Skeleton className="h-16 w-1/2 rounded-lg" />
                    <Skeleton className="h-10 w-3/5 ml-auto rounded-lg" />
                </div>
                 <div className="p-4 border-t border-border bg-muted/50">
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col h-full">
             <div className="flex items-center p-3 border-b border-border bg-muted/50">
                 <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={() => router.push('/messages')}>
                    <ArrowLeft />
                </Button>
                <Link href={otherUserName && otherUserName.includes('&') ? '#' : `/profile/${otherUserName}`} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUserAvatar} />
                        <AvatarFallback>{otherUserName?.charAt(0) ?? '?'}</AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold">{otherUserName}</h2>
                </Link>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-background/50">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== currentUser?.uid && (
                            <Avatar className="h-8 w-8 self-end">
                                <AvatarImage src={chatDetails?.userAvatars[msg.senderId]} />
                                <AvatarFallback>{chatDetails?.userNames[msg.senderId]?.charAt(0) ?? '?'}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`flex flex-col group max-w-xs md:max-w-md ${msg.senderId === currentUser?.uid ? 'items-end' : 'items-start'}`}>
                            <div className={`p-3 rounded-2xl ${msg.senderId === currentUser?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border border-border rounded-bl-none'}`}>
                                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                {msg.imageUrl && <Image src={msg.imageUrl} alt="Sent image" width={250} height={250} className="rounded-lg mt-1" />}
                                {msg.videoUrl && <video src={msg.videoUrl} controls className="rounded-lg mt-1 w-full max-w-[250px]" />}
                            </div>
                            <p className="text-xs mt-1 px-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                {msg.timestamp ? format(new Date(msg.timestamp.seconds * 1000), 'p') : ''}
                            </p>
                        </div>
                    </div>
                ))}
                 <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-border bg-muted/50">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                         <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message or paste a link..."
                            autoComplete="off"
                            className="pr-10"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ImageIcon className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default function ChatPage() {
    const params = useParams();
    const chatId = params?.chatId as string;
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const ADMIN_EMAIL = 'fortunedomination@gmail.com';
    const router = useRouter();
    
     useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                 setIsAdmin(user.email === ADMIN_EMAIL);
            } else {
                router.push('/admin/login');
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-0 md:px-4 py-0 md:py-8 flex h-[calc(100vh-10rem)]">
                <div className="flex flex-grow bg-card border border-border rounded-none md:rounded-lg overflow-hidden">
                    <ChatList currentUser={currentUser} activeChatId={chatId} isAdmin={isAdmin} />
                    <ChatView chatId={chatId} />
                </div>
            </main>
            <Footer />
        </div>
    );
}
