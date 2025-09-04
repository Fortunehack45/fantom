
'use client';

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc, setDoc, getDoc, writeBatch, where, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowUp, ArrowDown, MessageSquare, ArrowRight, Check, X, ThumbsUp, Share2, Wrench, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link";
import { VerificationBadge } from "@/components/icons/verification-badge";


interface BlogPost { id: string; title: string; content: string; imageUrl?: string; videoUrl?: string; category: string; }
interface RosterMember { id: string; name: string; rank: string; game: string; role: string; server: string; avatarUrl?: string; }
interface Announcement { id: string; author: string; authorImageUrl?: string; content: string; }
interface Game { id:string; name: string; imageUrl: string; hint: string; }
interface HeroImage { id: string; src: string; alt: string; hint: string; }
interface TimelineEvent { id: string; year: string; title: string; description: string; position: number; }
interface CoreValue { id: string; title: string; description: string; }
interface GalleryImage { id: string; src: string; alt: string; hint: string; }
interface SiteSettings { twitterUrl?: string; discordUrl?: string; youtubeUrl?: string; twitchUrl?: string; developerName?: string; developerUrl?: string; recruitmentUrl?: string; }
interface AboutPageContent { 
    heroImageUrl?: string; heroTitle?: string; heroSubtitle?: string;
    missionImageUrl?: string; missionTitle?: string; missionDescription?: string; missionTagline?: string;
    founderImageUrl?: string; founderName?: string; founderTitle?: string; founderQuote?: string; founderTagline?: string;
    timelineTitle?: string; timelineTagline?: string;
    valuesTitle?: string; valuesTagline?: string;
    galleryTitle?: string; galleryTagline?: string;
}
interface UserProfile {
    uid: string;
    email: string;
    username: string;
    photoURL: string;
    role: 'Creator' | 'Clan Owner' | 'User';
    verification: 'None' | 'Blue' | 'Gold';
    lowercaseUsername?: string;
}
interface UserActivity {
    id: string;
    type: 'comment' | 'reply' | 'like_post' | 'like_short' | 'share_short';
    content: string; // The comment content, or the title of the liked/shared item
    timestamp: any;
    targetTitle: string; // Title of the post/short
    targetSlug?: string; // Slug for blog posts
    targetId?: string; // ID for shorts
}
interface VerificationRequest {
    id: string;
    userId: string;
    username: string;
    requestedLevel: 'Blue' | 'Gold';
    status: 'pending' | 'approved' | 'denied';
    timestamp: any;
}


// Union type for all editable items
type EditableItem = BlogPost | RosterMember | Announcement | Game | HeroImage | TimelineEvent | CoreValue | GalleryImage;
type CollectionName = 'blogPosts' | 'roster' | 'announcements' | 'games' | 'heroImages' | 'timelineEvents' | 'coreValues' | 'galleryImages';


export default function AdminPage() {
    const { toast } = useToast();
    // Data states
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
    const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
    
    // Content states
    const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
    const [aboutPageContent, setAboutPageContent] = useState<AboutPageContent>({});

    // Form states for new items
    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '', category: 'News' });
    const [newMember, setNewMember] = useState({ name: '', rank: '', game: '', role: '', server: '', avatarUrl: '' });
    const [newAnnouncement, setNewAnnouncement] = useState({ author: '', content: '', authorImageUrl: '' });
    const [newGame, setNewGame] = useState({ name: '', imageUrl: '', hint: '' });
    const [newHeroImage, setNewHeroImage] = useState({ src: '', alt: '', hint: '' });
    const [newTimelineEvent, setNewTimelineEvent] = useState({ year: '', title: '', description: '' });
    const [newCoreValue, setNewCoreValue] = useState({ title: '', description: '' });
    const [newGalleryImage, setNewGalleryImage] = useState({ src: '', alt: '', hint: '' });

    // Modal/Dialog states
    const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
    const [currentCollection, setCurrentCollection] = useState<CollectionName | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ collectionName: string, id: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [selectedUserForActivity, setSelectedUserForActivity] = useState<UserProfile | null>(null);
    const [isFixingUsers, setIsFixingUsers] = useState(false);


    const fetchData = async <T extends {id: string}>(collectionName: string, setData: React.Dispatch<React.SetStateAction<T[]>>, q?: any) => {
        try {
            const querySnapshot = await getDocs(q || collection(db, collectionName));
            const data: T[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
            setData(data);
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            toast({ variant: "destructive", title: "Error", description: `Could not fetch ${collectionName}.` });
        }
    };
    
    // Initial data fetch
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = () => {
        fetchData<BlogPost>("blogPosts", setBlogPosts, query(collection(db, "blogPosts"), orderBy("date", "desc")));
        fetchData<RosterMember>("roster", setRoster);
        fetchData<Announcement>("announcements", setAnnouncements, query(collection(db, "announcements"), orderBy("date", "desc")));
        fetchData<Game>("games", setGames);
        fetchData<HeroImage>("heroImages", setHeroImages);
        fetchData<TimelineEvent>("timelineEvents", setTimelineEvents, query(collection(db, "timelineEvents"), orderBy("position", "asc")));
        fetchData<CoreValue>("coreValues", setCoreValues);
        fetchData<GalleryImage>("galleryImages", setGalleryImages);
        fetchData<UserProfile>('users', setUsers);
        fetchData<VerificationRequest>('verificationRequests', setVerificationRequests, query(collection(db, 'verificationRequests'), where('status', '==', 'pending'), orderBy('timestamp', 'asc')));
        fetchSiteSettings();
        fetchPageContent();
    }
    
    const fetchSiteSettings = async () => {
        try {
            const docRef = doc(db, "siteSettings", "footer");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSiteSettings(docSnap.data() as SiteSettings);
            }
        } catch (error) {
            console.error("Error fetching site settings:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch site settings." });
        }
    };

    const fetchPageContent = async () => {
        try {
            const aboutDocRef = doc(db, "pageContent", "about");
            const aboutDocSnap = await getDoc(aboutDocRef);
            if (aboutDocSnap.exists()) {
                setAboutPageContent(aboutDocSnap.data() as AboutPageContent);
            }
        } catch (error) {
            console.error("Error fetching page content:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch page content." });
        }
    };
    
    // Generic Add Function
    const handleAddItem = async (e: React.FormEvent, collectionName: string, newItem: any, resetter: () => void) => {
        e.preventDefault();
        const requiredFields = Object.keys(newItem).filter(key => !key.toLowerCase().includes('url'));
        const isMissingFields = requiredFields.some(field => {
            const value = newItem[field as keyof typeof newItem];
            return typeof value === 'string' && value.trim() === '';
        });

        if (isMissingFields) {
             toast({ variant: "destructive", title: "Error", description: `Please fill out all required fields.` });
             return;
        }
        
        try {
            await addDoc(collection(db, collectionName), newItem);
            resetter();
            fetchAllData();
            toast({ title: "Success", description: `${collectionName.slice(0, -1)} added.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Could not add ${collectionName.slice(0, -1)}.` });
        }
    };
    
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        const { name, rank, game, role, server, avatarUrl } = newMember;
        if (name && rank && game && role && server) {
             try {
                await addDoc(collection(db, 'roster'), {
                    ...newMember,
                    avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`
                });
                setNewMember({ name: '', rank: '', game: '', role: '', server: '', avatarUrl: '' });
                fetchAllData();
                toast({ title: "Success", description: "Roster member added." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not add roster member." });
            }
        } else {
             toast({ variant: "destructive", title: "Error", description: "Please fill out all required fields for the member." });
        }
    };

    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newAnnouncement.author && newAnnouncement.content) {
            try {
                await addDoc(collection(db, "announcements"), {
                    ...newAnnouncement,
                    date: serverTimestamp(),
                    authorImageUrl: newAnnouncement.authorImageUrl || `https://picsum.photos/40/40?random=${Date.now()}`
                });
                setNewAnnouncement({ author: '', content: '', authorImageUrl: ''});
                fetchAllData();
                toast({ title: "Success", description: "Announcement added." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not add announcement." });
            }
        }
    };
    
    const handleAddTimelineEvent = async (e: React.FormEvent) => {
        e.preventDefault();
         if (newTimelineEvent.year && newTimelineEvent.title && newTimelineEvent.description) {
            try {
                const newPosition = timelineEvents.length > 0 ? Math.max(...timelineEvents.map(e => e.position)) + 1 : 0;
                await addDoc(collection(db, "timelineEvents"), {
                    ...newTimelineEvent,
                    position: newPosition,
                });
                setNewTimelineEvent({ year: '', title: '', description: '' });
                fetchAllData();
                toast({ title: "Success", description: "Timeline event added." });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not add timeline event." });
            }
        }
    };

    const handleMoveTimelineEvent = async (index: number, direction: 'up' | 'down') => {
        const events = [...timelineEvents];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= events.length) return;

        // Swap positions in the array first for immediate UI feedback
        const temp = events[index];
        events[index] = events[newIndex];
        events[newIndex] = temp;
        
        // Update position numbers
        const updatedEvents = events.map((event, idx) => ({ ...event, position: idx }));
        setTimelineEvents(updatedEvents);

        try {
            const batch = writeBatch(db);
            updatedEvents.forEach(event => {
                const docRef = doc(db, 'timelineEvents', event.id);
                batch.update(docRef, { position: event.position });
            });
            await batch.commit();
            toast({ title: "Success", description: "Timeline order updated." });
            // No need to fetchAllData() because we updated state locally for instant feedback
        } catch (error) {
            console.error("Error reordering timeline:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not reorder timeline. Reverting changes." });
            fetchAllData(); // Revert local state on error
        }
    };

    const handleUpdateSiteSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "siteSettings", "footer"), siteSettings, { merge: true });
            toast({ title: "Success", description: "Site settings updated successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update site settings." });
        }
    };

    const handleUpdatePageContent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "pageContent", "about"), aboutPageContent, { merge: true });
            toast({ title: "Success", description: "Page content updated successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update page content." });
        }
    };

    const handleDeleteItem = async () => {
        if (!deletingItem) return;
        const { collectionName, id } = deletingItem;
        try {
            await deleteDoc(doc(db, collectionName, id));
            fetchAllData();
            toast({ title: "Success", description: `Item deleted successfully.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Could not delete item.` });
        } finally {
            setDeletingItem(null);
        }
    };

    const openEditModal = (item: EditableItem, collection: CollectionName) => {
        setEditingItem(item);
        setCurrentCollection(collection);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = async () => {
        if (!editingItem || !currentCollection) return;
        
        try {
            const { id, ...data } = editingItem;
            await updateDoc(doc(db, currentCollection, id), data);
            toast({ title: 'Success', description: 'Item updated successfully.' });
            setIsEditModalOpen(false);
            setEditingItem(null);
            setCurrentCollection(null);
            fetchAllData();
        } catch (error) {
            console.error('Error updating item:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item.' });
        }
    };

  const handleVerificationChange = async (userId: string, verification: 'None' | 'Blue' | 'Gold') => {
    try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { verification });
        toast({ title: 'Success', description: 'User verification status updated.' });
        fetchAllData(); // Refresh user list
    } catch (error) {
        console.error("Error updating verification: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update verification status.' });
    }
  };

  const fetchUserActivity = async (userId: string) => {
    setUserActivity([]);
    const allActivity: UserActivity[] = [];

    // Fetch comments
    const blogPostsSnap = await getDocs(collection(db, 'blogPosts'));
    for (const postDoc of blogPostsSnap.docs) {
        const commentsRef = collection(db, 'blogPosts', postDoc.id, 'comments');
        const commentsQuery = query(commentsRef, where('authorId', '==', userId));
        const commentsSnap = await getDocs(commentsQuery);
        commentsSnap.forEach(commentDoc => {
            allActivity.push({
                id: commentDoc.id,
                type: 'comment',
                content: commentDoc.data().content,
                timestamp: commentDoc.data().timestamp,
                targetTitle: postDoc.data().title,
                targetSlug: postDoc.data().slug,
            });
        });

        // Fetch replies
        const allCommentsForPostRef = collection(db, 'blogPosts', postDoc.id, 'comments');
        const allCommentsForPostSnap = await getDocs(allCommentsForPostRef);
        for(const commentDoc of allCommentsForPostSnap.docs) {
            const repliesRef = collection(db, 'blogPosts', postDoc.id, 'comments', commentDoc.id, 'replies');
            const repliesQuery = query(repliesRef, where('authorId', '==', userId));
            const repliesSnap = await getDocs(repliesQuery);
            repliesSnap.forEach(replyDoc => {
                 allActivity.push({
                    id: replyDoc.id,
                    type: 'reply',
                    content: replyDoc.data().content,
                    timestamp: replyDoc.data().timestamp,
                    targetTitle: postDoc.data().title,
                    targetSlug: postDoc.data().slug,
                });
            });
        }
    }
    
    // Fetch liked posts
    const likedPostsQuery = query(collection(db, 'blogPosts'), where('likes', 'array-contains', userId));
    const likedPostsSnap = await getDocs(likedPostsQuery);
    likedPostsSnap.forEach(postDoc => {
        allActivity.push({
            id: `like-${postDoc.id}`,
            type: 'like_post',
            content: `Liked post: "${postDoc.data().title}"`,
            timestamp: postDoc.data().date, // This is an approximation
            targetTitle: postDoc.data().title,
            targetSlug: postDoc.data().slug,
        });
    });

    // Fetch liked shorts
    const likedShortsQuery = query(collection(db, 'shorts'), where('likes', 'array-contains', userId));
    const likedShortsSnap = await getDocs(likedShortsQuery);
    likedShortsSnap.forEach(shortDoc => {
        allActivity.push({
            id: `like-${shortDoc.id}`,
            type: 'like_short',
            content: `Liked short: "${shortDoc.data().title}"`,
            timestamp: shortDoc.data().timestamp,
            targetTitle: shortDoc.data().title,
            targetId: shortDoc.id,
        });
    });

    allActivity.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
    setUserActivity(allActivity);
  };

  const openActivityModal = async (user: UserProfile) => {
      setSelectedUserForActivity(user);
      setIsActivityModalOpen(true);
      await fetchUserActivity(user.uid);
  }
  
  const handleVerificationRequest = async (request: VerificationRequest, newStatus: 'approved' | 'denied') => {
      try {
          const batch = writeBatch(db);
          const requestRef = doc(db, 'verificationRequests', request.id);
          const userRef = doc(db, 'users', request.userId);

          batch.update(requestRef, { status: newStatus });

          if (newStatus === 'approved') {
              const newRole = request.requestedLevel === 'Gold' ? 'Clan Owner' : 'Creator';
              batch.update(userRef, {
                  verification: request.requestedLevel,
                  role: newRole,
              });
          }

          await batch.commit();

          toast({ title: 'Success', description: `Request has been ${newStatus}.` });
          fetchAllData(); // Refresh requests and users list
      } catch (error) {
          console.error(`Error handling verification request:`, error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not process the request.' });
      }
  };

    const handleFixUserData = async () => {
        setIsFixingUsers(true);
        toast({ title: 'Starting User Data Fix', description: 'This may take a moment...' });

        try {
            const userProfiles: { [uid: string]: UserProfile } = {};
            const usersSnapshot = await getDocs(collection(db, 'users'));
            usersSnapshot.forEach(doc => {
                userProfiles[doc.id] = { uid: doc.id, ...doc.data() } as UserProfile;
            });

            const batch = writeBatch(db);
            let updatesCount = 0;

            // Function to update authorName if it doesn't match
            const processDoc = (docSnap: any, collectionName: string) => {
                const data = docSnap.data();
                const author = userProfiles[data.authorId];
                if (author && author.username && data.authorName !== author.username) {
                    batch.update(docSnap.ref, { authorName: author.username });
                    updatesCount++;
                }
            };
            
            // Fix blogPosts
            const blogPostsSnapshot = await getDocs(collection(db, 'blogPosts'));
            blogPostsSnapshot.forEach(postDoc => processDoc(postDoc, 'blogPosts'));

            // Fix shorts
            const shortsSnapshot = await getDocs(collection(db, 'shorts'));
            shortsSnapshot.forEach(shortDoc => processDoc(shortDoc, 'shorts'));

            // Fix comments and replies (using collectionGroup)
            const commentsSnapshot = await getDocs(collectionGroup(db, 'comments'));
            commentsSnapshot.forEach(commentDoc => processDoc(commentDoc, 'comments'));

            const repliesSnapshot = await getDocs(collectionGroup(db, 'replies'));
            repliesSnapshot.forEach(replyDoc => processDoc(replyDoc, 'replies'));
            
            // Fix lowercase usernames
            usersSnapshot.forEach(userDoc => {
                const userData = userDoc.data() as UserProfile;
                if (userData.username && !userData.lowercaseUsername) {
                    const userRef = doc(db, 'users', userDoc.id);
                    batch.update(userRef, { lowercaseUsername: userData.username.toLowerCase() });
                    updatesCount++;
                }
            });

            if (updatesCount > 0) {
                await batch.commit();
                toast({ title: 'Success!', description: `Fixed ${updatesCount} records in the database.` });
            } else {
                toast({ title: 'All Good!', description: 'No outdated user data found.' });
            }
             fetchAllData();
        } catch (error) {
            console.error("Error fixing user data:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while fixing data.' });
        } finally {
            setIsFixingUsers(false);
        }
    };


  const renderEditForm = () => {
    if (!editingItem) return null;
    
    // Type guards to determine the form fields
    if ('title' in editingItem && 'content' in editingItem) { // BlogPost
        return <>
            <DialogDescription>Make changes to your blog post here. Click save when you're done.</DialogDescription>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.imageUrl} onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Video URL (YouTube, TikTok, Facebook)</Label><Input value={editingItem.videoUrl} onChange={e => setEditingItem({ ...editingItem, videoUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} rows={10} /></div>
        </>;
    }
    if ('name' in editingItem && 'rank' in editingItem) { // RosterMember
        return <>
            <DialogDescription>Edit the details for this roster member.</DialogDescription>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Game</Label><Input value={editingItem.game} onChange={e => setEditingItem({ ...editingItem, game: e.target.value })} /></div>
                <div className="space-y-2"><Label>Rank</Label><Input value={editingItem.rank} onChange={e => setEditingItem({ ...editingItem, rank: e.target.value })} /></div>
                <div className="space-y-2"><Label>Role</Label><Input value={editingItem.role} onChange={e => setEditingItem({ ...editingItem, role: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Server</Label><Input value={editingItem.server} onChange={e => setEditingItem({ ...editingItem, server: e.target.value })} /></div>
            <div className="space-y-2"><Label>Avatar URL</Label><Input value={editingItem.avatarUrl} onChange={e => setEditingItem({ ...editingItem, avatarUrl: e.target.value })} /></div>
        </>;
    }
    if ('author' in editingItem) { // Announcement
        return <>
            <DialogDescription>Update the announcement content.</DialogDescription>
            <div className="space-y-2"><Label>Author</Label><Input value={editingItem.author} onChange={e => setEditingItem({ ...editingItem, author: e.target.value })} /></div>
            <div className="space-y-2"><Label>Author PFP URL</Label><Input value={editingItem.authorImageUrl} onChange={e => setEditingItem({ ...editingItem, authorImageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} /></div>
        </>;
    }
    if ('name' in editingItem && 'imageUrl' in editingItem) { // Game
         return <>
            <DialogDescription>Edit the game details.</DialogDescription>
            <div className="space-y-2"><Label>Game Name</Label><Input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.imageUrl} onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image Hint</Label><Input value={editingItem.hint} onChange={e => setEditingItem({ ...editingItem, hint: e.target.value })} /></div>
        </>;
    }
    if ('src' in editingItem) { // HeroImage or GalleryImage
        return <>
            <DialogDescription>Update the image source and alternative text.</DialogDescription>
            <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.src} onChange={e => setEditingItem({ ...editingItem, src: e.target.value })} /></div>
            <div className="space-y-2"><Label>Alt Text</Label><Input value={editingItem.alt} onChange={e => setEditingItem({ ...editingItem, alt: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image Hint</Label><Input value={editingItem.hint} onChange={e => setEditingItem({ ...editingItem, hint: e.target.value })} /></div>
        </>;
    }
     if ('year' in editingItem) { // TimelineEvent
        return <>
            <DialogDescription>Edit the timeline event details.</DialogDescription>
            <div className="space-y-2"><Label>Year</Label><Input value={editingItem.year} onChange={e => setEditingItem({ ...editingItem, year: e.target.value })} /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} /></div>
        </>;
    }
    if ('title' in editingItem && 'description' in editingItem && !('year' in editingItem)) { // CoreValue
        return <>
            <DialogDescription>Edit the core value details.</DialogDescription>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} /></div>
        </>;
    }
    return <p>This item cannot be edited.</p>;
  };

  const ActivityIcon = ({ type }: { type: UserActivity['type'] }) => {
    switch (type) {
        case 'comment':
        case 'reply':
            return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case 'like_post':
        case 'like_short':
            return <ThumbsUp className="h-4 w-4 text-pink-500" />;
        case 'share_short':
            return <Share2 className="h-4 w-4 text-green-500" />;
        default:
            return null;
    }
  }

  const ActivityLink = ({ activity, username }: { activity: UserActivity, username: string }) => {
    if (activity.targetSlug) {
        return (
            <Link href={`/blog/${activity.targetSlug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="link" className="h-auto p-0 mt-1">
                    View Post <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </Link>
        )
    }
    if (activity.type === 'like_short' || activity.type === 'share_short' || (activity.type === 'comment' && !activity.targetSlug)) {
        // Assuming comments without a slug are for shorts
        return (
            <Link href={`/shorts#${activity.targetId}`} target="_blank" rel="noopener noreferrer">
                <Button variant="link" className="h-auto p-0 mt-1">
                    View Short <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </Link>
        )
    }
    // Fallback for user profile link from activity
    return (
        <Link href={`/profile/${username}`} target="_blank" rel="noopener noreferrer">
            <Button variant="link" className="h-auto p-0 mt-1">
                View Profile <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
        </Link>
    )
  }

  return (
    <>
    <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the item.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeletingItem(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               {renderEditForm()}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateItem}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>User Activity: {selectedUserForActivity?.username}</DialogTitle>
                <DialogDescription>A list of all activities performed by this user, sorted by most recent.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4">
                {userActivity.length > 0 ? (
                    userActivity.map(activity => (
                        <div key={activity.id} className="text-sm p-3 bg-muted/50 rounded-lg flex items-start gap-3">
                           <div className="mt-1"><ActivityIcon type={activity.type} /></div>
                           <div className="flex-grow">
                               <p className="text-muted-foreground">
                                   <span className="text-xs">({activity.timestamp ? formatDistanceToNow(new Date(activity.timestamp.seconds * 1000), { addSuffix: true }) : 'sometime ago'})</span>
                               </p>
                               <p className="mt-1">{activity.content}</p>
                                <ActivityLink activity={activity} username={selectedUserForActivity!.username} />
                           </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        <MessageSquare className="mx-auto h-8 w-8" />
                        <p className="mt-2">No activity found for this user.</p>
                    </div>
                )}
            </div>
        </DialogContent>
    </Dialog>


    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage your website's content from here.</p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-7">
            <TabsTrigger value="blog">Blog Posts</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
            <TabsTrigger value="about">About Page</TabsTrigger>
            <TabsTrigger value="site">Site Wide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
             <Card className="bg-card mt-6">
                <CardHeader>
                  <CardTitle>Manage Blog Posts</CardTitle>
                  <CardDescription>View, edit, or delete user-submitted blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[36rem] overflow-y-auto pr-4">
                      {blogPosts.map((post) => (
                      <div key={post.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <p className="font-medium truncate pr-2">{post.title}</p>
                          <div className="flex gap-2 flex-shrink-0">
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(post, 'blogPosts')}><Edit className="h-4 w-4"/></Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setDeletingItem({collectionName: 'blogPosts', id: post.id})}><Trash2 className="h-4 w-4"/></Button>
                          </div>
                      </div>
                      ))}
                  </div>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roster">
             <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Clan Roster</CardTitle><CardDescription>Add, edit, or delete members from the clan roster.</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Member</h3>
                             <form className="space-y-4" onSubmit={handleAddMember}>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label htmlFor="member-name">Name</Label><Input id="member-name" placeholder="Member's name" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} required/></div>
                                    <div className="space-y-2"><Label htmlFor="member-game">Game</Label><Input id="member-game" placeholder="e.g., Valorant" value={newMember.game} onChange={(e) => setNewMember({...newMember, game: e.target.value})} required/></div>
                                    <div className="space-y-2"><Label htmlFor="member-rank">Rank</Label><Input id="member-rank" placeholder="e.g., Diamond" value={newMember.rank} onChange={(e) => setNewMember({...newMember, rank: e.target.value})} required/></div>
                                    <div className="space-y-2"><Label htmlFor="member-role">Role</Label><Input id="member-role" placeholder="e.g., Pro" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} required/></div>
                                </div>
                                <div className="space-y-2"><Label htmlFor="member-server">Server</Label><Input id="member-server" placeholder="Enter server ID" value={newMember.server} onChange={(e) => setNewMember({...newMember, server: e.target.value})} required/></div>
                                <div className="space-y-2"><Label htmlFor="member-avatar">Avatar URL (Optional)</Label><Input id="member-avatar" placeholder="https://pinterest.com/..." value={newMember.avatarUrl} onChange={(e) => setNewMember({...newMember, avatarUrl: e.target.value})}/></div>
                                <Button variant="primary" type="submit">Add Member</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Roster</h3>
                             <div className="max-h-[30rem] overflow-y-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Game</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                                {roster.map((member) => (<TableRow key={member.id} className="hover:bg-muted/50"><TableCell>{member.name}</TableCell><TableCell>{member.game}</TableCell><TableCell><Badge variant="secondary">{member.role}</Badge></TableCell><TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(member, 'roster')}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setDeletingItem({collectionName: 'roster', id: member.id})}><Trash2 className="h-4 w-4"/></Button>
                                </TableCell></TableRow>))}
                             </TableBody></Table></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
              <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Discord Announcements</CardTitle><CardDescription>Create or delete Discord announcements.</CardDescription></CardHeader>
                <CardContent>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">New Announcement</h3>
                             <form className="space-y-4" onSubmit={handleAddAnnouncement}>
                                <div><Label htmlFor="ann-author">Author</Label><Input id="ann-author" placeholder="@YourDiscordHandle" value={newAnnouncement.author} onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})} required /></div>
                                <div><Label htmlFor="ann-author-image-url">Author PFP URL (Optional)</Label><Input id="ann-author-image-url" type="text" placeholder="https://your-image-url.com/profile.png" value={newAnnouncement.authorImageUrl} onChange={(e) => setNewAnnouncement({...newAnnouncement, authorImageUrl: e.target.value})} /></div>
                                <div><Label htmlFor="ann-content">Content</Label><Textarea id="ann-content" placeholder="Write your announcement here..." value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required /></div>
                                <Button variant="primary" type="submit">Add Announcement</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Announcements</h3>
                             <div className="space-y-2 max-h-[30rem] overflow-y-auto pr-4">
                                {announcements.map((ann) => (
                                <div key={ann.id} className="flex justify-between items-start bg-background/50 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div><p className="font-bold text-sm">{ann.author}</p><p className="text-sm text-muted-foreground">{ann.content}</p></div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(ann, 'announcements')}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setDeletingItem({collectionName: 'announcements', id: ann.id})}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-card mt-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>Manage Users</CardTitle>
                            <CardDescription>View user roles, manage verification, and repair legacy data.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={handleFixUserData} disabled={isFixingUsers}>
                            {isFixingUsers ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wrench className="mr-2 h-4 w-4" />}
                            Fix User Data
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="max-h-[36rem] overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Verification</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{user.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Clan Owner' ? 'primary' : 'secondary'}>
                                                {user.role || 'User'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                        {user.verification === 'Blue' && <VerificationBadge className="text-[#1D9BF0] h-5 w-5" />}
                                                        {user.verification === 'Gold' && <VerificationBadge className="text-[#A47C1B] h-5 w-5" />}
                                                        {user.verification}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleVerificationChange(user.uid, 'None')}>None</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleVerificationChange(user.uid, 'Blue')}>
                                                        <VerificationBadge className="mr-2 h-5 w-5 text-[#1D9BF0]" /> Blue
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleVerificationChange(user.uid, 'Gold')}>
                                                        <VerificationBadge className="mr-2 h-5 w-5 text-[#A47C1B]" /> Gold
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openActivityModal(user)}>
                                                View Activity
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
             <Card className="bg-card mt-6">
                <CardHeader>
                  <CardTitle>Verification Requests</CardTitle>
                  <CardDescription>Approve or deny user requests for verification.</CardDescription>
                </CardHeader>
                <CardContent>
                    {verificationRequests.length > 0 ? (
                        <div className="max-h-[36rem] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Requested Level</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {verificationRequests.map(req => (
                                        <TableRow key={req.id}>
                                            <TableCell className="font-medium">{req.username}</TableCell>
                                            <TableCell>
                                                <Badge variant={req.requestedLevel === 'Gold' ? 'primary' : 'secondary'} className="flex gap-2 items-center w-fit">
                                                    {req.requestedLevel === 'Gold' && <VerificationBadge className="h-4 w-4 text-[#A47C1B]" />}
                                                    {req.requestedLevel === 'Blue' && <VerificationBadge className="h-4 w-4 text-[#1D9BF0]" />}
                                                    {req.requestedLevel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{req.timestamp ? formatDistanceToNow(new Date(req.timestamp.seconds * 1000), { addSuffix: true }) : 'N/A'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="icon" variant="outline" className="text-green-500 hover:text-green-500 hover:bg-green-500/10" onClick={() => handleVerificationRequest(req, 'approved')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                 <Button size="icon" variant="outline" className="text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={() => handleVerificationRequest(req, 'denied')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No pending verification requests.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
                <Card className="bg-card mt-6">
                <CardHeader>
                    <CardTitle>Manage About Page</CardTitle>
                    <CardDescription>Update all content on the About page. Click "Save All Changes" at the bottom when you're done.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-8" onSubmit={handleUpdatePageContent}>
                        {/* Hero Section */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Hero Section</h3>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Hero Title</Label><Input value={aboutPageContent.heroTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, heroTitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Hero Subtitle</Label><Input value={aboutPageContent.heroSubtitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, heroSubtitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Hero Image URL</Label><Input value={aboutPageContent.heroImageUrl || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, heroImageUrl: e.target.value })} /></div>
                            </div>
                        </div>
                        {/* Mission Section */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Mission Section</h3>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Mission Tagline</Label><Input value={aboutPageContent.missionTagline || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, missionTagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Mission Title</Label><Input value={aboutPageContent.missionTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, missionTitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Mission Description</Label><Textarea value={aboutPageContent.missionDescription || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, missionDescription: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Mission Image URL</Label><Input value={aboutPageContent.missionImageUrl || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, missionImageUrl: e.target.value })} /></div>
                            </div>
                        </div>
                         {/* Founder Section */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Founder Section</h3>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Founder Tagline</Label><Input value={aboutPageContent.founderTagline || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, founderTagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Founder Title</Label><Input value={aboutPageContent.founderTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, founderTitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Founder Name</Label><Input value={aboutPageContent.founderName || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, founderName: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Founder Quote</Label><Textarea value={aboutPageContent.founderQuote || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, founderQuote: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Founder Image URL</Label><Input value={aboutPageContent.founderImageUrl || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, founderImageUrl: e.target.value })} /></div>
                            </div>
                        </div>
                        {/* Section Titles */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Section Titles & Taglines</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2"><Label>Timeline Tagline</Label><Input value={aboutPageContent.timelineTagline || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, timelineTagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Timeline Title</Label><Input value={aboutPageContent.timelineTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, timelineTitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Values Tagline</Label><Input value={aboutPageContent.valuesTagline || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, valuesTagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Values Title</Label><Input value={aboutPageContent.valuesTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, valuesTitle: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Gallery Tagline</Label><Input value={aboutPageContent.galleryTagline || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, galleryTagline: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Gallery Title</Label><Input value={aboutPageContent.galleryTitle || ''} onChange={(e) => setAboutPageContent({ ...aboutPageContent, galleryTitle: e.target.value })} /></div>
                            </div>
                        </div>
                        <Button type="submit" variant="primary">Save All Changes</Button>
                    </form>

                    <div className="grid md:grid-cols-2 gap-8 mt-8">
                      {/* Timeline Management */}
                      <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Timeline Events</h3>
                           <form className="space-y-4 mb-6" onSubmit={handleAddTimelineEvent}>
                                  <div><Label>Year</Label><Input value={newTimelineEvent.year} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, year: e.target.value })} required /></div>
                                  <div><Label>Title</Label><Input value={newTimelineEvent.title} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, title: e.target.value })} required /></div>
                                  <div><Label>Description</Label><Textarea value={newTimelineEvent.description} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })} required /></div>
                                  <Button variant="secondary" type="submit" size="sm">Add Event</Button>
                            </form>
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-4">
                                {timelineEvents.map((event, index) => (
                                    <div key={event.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                        <span className="truncate pr-2">{event.year} - {event.title}</span>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveTimelineEvent(index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveTimelineEvent(index, 'down')} disabled={index === timelineEvents.length - 1}><ArrowDown className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openEditModal(event, 'timelineEvents')}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeletingItem({collectionName: 'timelineEvents', id: event.id})}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                           </div>
                      </div>
                      {/* Core Values Management */}
                      <div className="p-4 border rounded-lg">
                          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Core Values</h3>
                          <form className="space-y-4 mb-6" onSubmit={(e) => handleAddItem(e, 'coreValues', newCoreValue, () => setNewCoreValue({ title: '', description: '' }))}>
                                  <div><Label>Title</Label><Input value={newCoreValue.title} onChange={(e) => setNewCoreValue({ ...newCoreValue, title: e.target.value })} required /></div>
                                  <div><Label>Description</Label><Textarea value={newCoreValue.description} onChange={(e) => setNewCoreValue({ ...newCoreValue, description: e.target.value })} required /></div>
                                  <Button variant="secondary" type="submit" size="sm">Add Value</Button>
                           </form>
                           <div className="space-y-2 max-h-60 overflow-y-auto pr-4">
                                {coreValues.map((value) => (
                                    <div key={value.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                        <span>{value.title}</span>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openEditModal(value, 'coreValues')}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeletingItem({collectionName: 'coreValues', id: value.id})}><Trash2 className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                           </div>
                      </div>
                    </div>
                     {/* Gallery Management */}
                     <div className="p-4 border rounded-lg mt-8">
                         <h3 className="text-lg font-semibold mb-4 border-b pb-2">Gallery Images</h3>
                         <div className="grid md:grid-cols-2 gap-8">
                             <div>
                                <h4 className="font-semibold mb-2">Add New Gallery Image</h4>
                                <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'galleryImages', newGalleryImage, () => setNewGalleryImage({ src: '', alt: '', hint: '' }))}>
                                    <div><Label>Image URL</Label><Input value={newGalleryImage.src} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, src: e.target.value })} required /></div>
                                    <div><Label>Alt Text</Label><Input value={newGalleryImage.alt} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, alt: e.target.value })} required /></div>
                                    <div><Label>Image Hint</Label><Input value={newGalleryImage.hint} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, hint: e.target.value })} required /></div>
                                    <Button variant="secondary" size="sm" type="submit">Add Image</Button>
                                </form>
                             </div>
                              <div>
                                <h4 className="font-semibold mb-2">Current Gallery Images</h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {galleryImages.map((img) => (
                                      <div key={img.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                          <Image src={img.src} alt={img.alt} width={80} height={80} className="rounded-md object-cover aspect-square" />
                                          <span className="truncate ml-4 flex-grow text-sm">{img.alt}</span>
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openEditModal(img, 'galleryImages')}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeletingItem({collectionName: 'galleryImages', id: img.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                             </div>
                         </div>
                     </div>

                </CardContent>
            </Card>
          </TabsContent>
          
           <TabsContent value="site">
              <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Site-Wide Content</CardTitle><CardDescription>Update content that appears across multiple pages, like the hero slideshow, games list, and footer links.</CardDescription></CardHeader>
                <CardContent>
                    <form className="space-y-8" onSubmit={handleUpdateSiteSettings}>
                        {/* General Links */}
                         <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Button & Footer Links</h3>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recruitment-url">Recruitment Button URL</Label>
                                    <Input id="recruitment-url" value={siteSettings.recruitmentUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, recruitmentUrl: e.target.value })} placeholder="https://your-recruitment-link.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="developer-name">Developer Name</Label>
                                    <Input id="developer-name" value={siteSettings.developerName || ''} onChange={(e) => setSiteSettings({ ...siteSettings, developerName: e.target.value })} placeholder="e.g., Fourtuna" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="developer-url">Developer URL</Label>
                                    <Input id="developer-url" value={siteSettings.developerUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, developerUrl: e.target.value })} placeholder="https://..." />
                                </div>
                             </div>
                            <h4 className="text-md font-semibold pt-6 mt-4 border-t">Social Media Links</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="twitter-url">Twitter URL</Label>
                                    <Input id="twitter-url" value={siteSettings.twitterUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discord-url">Discord URL</Label>
                                    <Input id="discord-url" value={siteSettings.discordUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, discordUrl: e.target.value })} placeholder="https://discord.gg/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="youtube-url">YouTube URL</Label>
                                    <Input id="youtube-url" value={siteSettings.youtubeUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="twitch-url">Twitch URL</Label>
                                    <Input id="twitch-url" value={siteSettings.twitchUrl || ''} onChange={(e) => setSiteSettings({ ...siteSettings, twitchUrl: e.target.value })} placeholder="https://twitch.tv/..." />
                                </div>
                            </div>
                        </div>
                        <Button type="submit" variant="primary">Save Link Settings</Button>
                    </form>

                     {/* Games Section */}
                     <div className="p-4 border rounded-lg mt-8">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Homepage Games</h3>
                         <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-semibold mb-2">Add New Game</h4>
                                <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'games', newGame, () => setNewGame({ name: '', imageUrl: '', hint: '' }))}>
                                    <div><Label>Game Name</Label><Input value={newGame.name} onChange={(e) => setNewGame({...newGame, name: e.target.value})} required /></div>
                                    <div><Label>Image URL</Label><Input type="text" value={newGame.imageUrl} onChange={(e) => setNewGame({...newGame, imageUrl: e.target.value})} required/></div>
                                    <div><Label>Image Hint</Label><Input value={newGame.hint} onChange={(e) => setNewGame({...newGame, hint: e.target.value})} required /></div>
                                    <Button variant="secondary" size="sm" type="submit">Add Game</Button>
                                </form>
                            </div>
                             <div>
                                <h4 className="font-semibold mb-2">Current Games</h4>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {games.map((game) => (
                                    <div key={game.id} className="relative group aspect-[3/4]">
                                        <Image src={game.imageUrl} alt={game.name} width={200} height={266} className="rounded-lg w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-2 text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="font-bold text-sm text-white mb-2">{game.name}</p>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditModal(game, 'games')}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeletingItem({collectionName: 'games', id: game.id})}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                     </div>

                      {/* Hero Images Section */}
                     <div className="p-4 border rounded-lg mt-8">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Homepage Hero Slideshow</h3>
                         <div className="grid md:grid-cols-2 gap-8">
                             <div>
                                <h4 className="font-semibold mb-2">Add New Hero Image</h4>
                                <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'heroImages', newHeroImage, () => setNewHeroImage({ src: '', alt: '', hint: '' }))}>
                                    <div><Label>Image URL</Label><Input value={newHeroImage.src} onChange={(e) => setNewHeroImage({ ...newHeroImage, src: e.target.value })} required /></div>
                                    <div><Label>Alt Text</Label><Input value={newHeroImage.alt} onChange={(e) => setNewHeroImage({ ...newHeroImage, alt: e.target.value })} required /></div>
                                    <div><Label>Image Hint</Label><Input value={newHeroImage.hint} onChange={(e) => setNewHeroImage({ ...newHeroImage, hint: e.target.value })} required /></div>
                                    <Button variant="secondary" size="sm" type="submit">Add Image</Button>
                                </form>
                             </div>
                             <div>
                                <h4 className="font-semibold mb-2">Current Hero Images</h4>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {heroImages.map((img) => (
                                      <div key={img.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                          <Image src={img.src} alt={img.alt} width={100} height={56} className="rounded-md object-cover" />
                                          <span className="truncate ml-4 flex-grow text-sm">{img.alt}</span>
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={() => openEditModal(img, 'heroImages')}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => setDeletingItem({collectionName: 'heroImages', id: img.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                             </div>
                         </div>
                     </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </>
  );
}
