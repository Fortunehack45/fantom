
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { Loader2, Search, UserX } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export interface FollowUser {
    id: string;
    username: string;
    photoURL?: string;
}

interface FollowListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: FollowUser[];
    isLoading: boolean;
}

export function FollowListDialog({ isOpen, onClose, title, users, isLoading }: FollowListDialogProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        A list of users {title === 'Followers' ? 'following this user' : 'this user is following'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <ScrollArea className="h-72">
                    <div className="space-y-4 pr-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <Link
                                    key={user.id}
                                    href={`/profile/${user.username}`}
                                    onClick={onClose}
                                    className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                    <Avatar>
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{user.username}</span>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-8">
                                <UserX className="h-12 w-12" />
                                <p className="mt-4 font-semibold">{searchTerm ? 'No users found' : `No ${title.toLowerCase()} yet`}</p>
                                <p className="text-sm">{searchTerm ? 'Try a different search term.' : ''}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
