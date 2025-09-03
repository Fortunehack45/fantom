
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, onSnapshot, addDoc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import Image from 'next/image';

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: any;
    imageUrl?: string;
    videoUrl?: string;
}

interface Chat {
    id: string;
    users: string[];
    userAvatars: { [key: string]: string };
    userNames: { [key: string]: string };
}

const isImage = (url: string) => /\.(jpeg|jpg|gif|png|webp)$/.test(url);
const isVideo = (url: string) => /\.(mp4|webm|ogg)$/.test(url);


export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatDetails, setChatDetails] = useState<Chat | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const params = useParams();
    const chatId = params?.chatId as string;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        if (!chatId || !currentUser) return;

        const chatDocRef = doc(db, 'chats', chatId);
        const unsubscribeChat = onSnapshot(chatDocRef, (doc) => {
            if (doc.exists()) {
                const chatData = { id: doc.id, ...doc.data() } as Chat;
                if (!chatData.users.includes(currentUser.uid)) {
                    router.push('/messages');
                    return;
                }
                setChatDetails(chatData);
            } else {
                router.push('/messages');
            }
        });

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const unsubscribeMessages = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
            setMessages(msgs);
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
        
        const messagePayload: any = {
            senderId: currentUser.uid,
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        try {
            const url = new URL(newMessage.trim());
            if (isImage(url.pathname)) {
                messagePayload.imageUrl = url.href;
                messagePayload.text = ''; // Clear text if it's an image
            } else if (isVideo(url.pathname)) {
                messagePayload.videoUrl = url.href;
                messagePayload.text = '';
            }
        } catch (_) {
            // Not a valid URL, treat as plain text
        }
        
        await addDoc(messagesRef, messagePayload);

        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
            lastMessage: messagePayload.imageUrl ? 'Image' : messagePayload.videoUrl ? 'Video' : newMessage,
            lastMessageTimestamp: serverTimestamp(),
        });
        
        setNewMessage('');
    };

    const otherUser = chatDetails ? chatDetails.users.find(uid => uid !== currentUser?.uid) : null;
    const otherUserName = otherUser ? chatDetails?.userNames[otherUser] : 'Loading...';
    const otherUserAvatar = otherUser ? chatDetails?.userAvatars[otherUser] : '';


    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-10rem)]">
                <div className="flex flex-col flex-grow bg-card border border-border rounded-lg overflow-hidden">
                    {/* Chat Header */}
                    <div className="flex items-center p-3 border-b border-border bg-muted/50">
                         <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push('/messages')}>
                            <ArrowLeft />
                        </Button>
                        <Link href={otherUserName ? `/profile/${otherUserName}` : '#'}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={otherUserAvatar} />
                                <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <div className="ml-4">
                            <h2 className="font-bold">{otherUserName}</h2>
                        </div>
                    </div>
                    {/* Messages Area */}
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {loading ? <p>Loading messages...</p> : messages.map(msg => (
                            <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'}`}>
                                {msg.senderId !== currentUser?.uid && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={otherUserAvatar} />
                                        <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.senderId === currentUser?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                                    {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                                    {msg.imageUrl && <Image src={msg.imageUrl} alt="Sent image" width={250} height={250} className="rounded-lg mt-2" />}
                                    {msg.videoUrl && <video src={msg.videoUrl} controls className="rounded-lg mt-2 w-full max-w-[250px]" />}
                                    <p className={`text-xs mt-1 opacity-70 ${msg.senderId === currentUser?.uid ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp ? format(new Date(msg.timestamp.seconds * 1000), 'p') : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                    {/* Message Input */}
                    <div className="p-4 border-t border-border bg-muted/50">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Input 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message or paste a link..."
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send />
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
