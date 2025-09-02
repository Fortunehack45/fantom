
'use client';

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


interface BlogPost { id: string; title: string; content: string; imageUrl?: string; category: string; }
interface RosterMember { id: string; name: string; rank: string; game: string; role: string; server: string; avatarUrl?: string; }
interface Announcement { id: string; author: string; authorImageUrl?: string; content: string; }
interface Game { id: string; name: string; imageUrl: string; hint: string; }
interface HeroImage { id: string; src: string; alt: string; hint: string; }
interface TimelineEvent { id: string; year: string; title: string; description: string; }
interface CoreValue { id: string; title: string; description: string; }
interface GalleryImage { id: string; src: string; alt: string; hint: string; }
interface FooterSettings { twitterUrl?: string; discordUrl?: string; youtubeUrl?: string; twitchUrl?: string; developerName?: string; developerUrl?: string;}

// Union type for all editable items
type EditableItem = BlogPost | RosterMember | Announcement | Game | HeroImage | TimelineEvent | CoreValue | GalleryImage;

export default function AdminPage() {
    const { toast } = useToast();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [games, setGames] = useState<Game[]>([]);
    const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [footerSettings, setFooterSettings] = useState<FooterSettings>({ twitterUrl: '', discordUrl: '', youtubeUrl: '', twitchUrl: '', developerName: '', developerUrl: ''});


    const [newPost, setNewPost] = useState({ title: '', content: '', imageUrl: '', category: 'News' });
    const [newMember, setNewMember] = useState({ name: '', rank: '', game: '', role: '', server: '', avatarUrl: '' });
    const [newAnnouncement, setNewAnnouncement] = useState({ author: '', content: '', authorImageUrl: '' });
    const [newGame, setNewGame] = useState({ name: '', imageUrl: '', hint: '' });
    const [newHeroImage, setNewHeroImage] = useState({ src: '', alt: '', hint: '' });
    const [newTimelineEvent, setNewTimelineEvent] = useState({ year: '', title: '', description: '' });
    const [newCoreValue, setNewCoreValue] = useState({ title: '', description: '' });
    const [newGalleryImage, setNewGalleryImage] = useState({ src: '', alt: '', hint: '' });

    const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ collectionName: string, id: string } | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


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
        fetchData<TimelineEvent>("timelineEvents", setTimelineEvents, query(collection(db, "timelineEvents"), orderBy("year", "asc")));
        fetchData<CoreValue>("coreValues", setCoreValues);
        fetchData<GalleryImage>("galleryImages", setGalleryImages);
        fetchFooterSettings();
    }
    
    const fetchFooterSettings = async () => {
        try {
            const docRef = doc(db, "siteSettings", "footer");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setFooterSettings(docSnap.data() as FooterSettings);
            }
        } catch (error) {
            console.error("Error fetching footer settings:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not fetch site settings." });
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
    
    // Blog Post Handlers
    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPost.title && newPost.content) {
            try {
                const slug = newPost.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                await addDoc(collection(db, "blogPosts"), { 
                    ...newPost,
                    slug: slug,
                    imageUrl: newPost.imageUrl || `https://picsum.photos/400/250?random=${Date.now()}`,
                    date: serverTimestamp(),
                    author: "Fantom eSport",
                    hint: "gamer portrait"
                });
                setNewPost({ title: '', content: '', imageUrl: '', category: 'News' });
                fetchAllData();
                toast({ title: "Success", description: "Blog post added." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not add blog post." });
            }
        }
    };

    // Roster Member Handlers
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

    // Announcement Handlers
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

    // Site Settings Handler
    const handleUpdateFooterSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await setDoc(doc(db, "siteSettings", "footer"), footerSettings, { merge: true });
            toast({ title: "Success", description: "Site settings updated successfully." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to update site settings." });
        }
    };

    // Generic Delete Function
    const handleDeleteItem = async () => {
        if (!deletingItem) return;
        const { collectionName, id } = deletingItem;
        try {
            await deleteDoc(doc(db, collectionName, id));
            fetchAllData();
            toast({ title: "Success", description: `${collectionName.slice(0, -1)} deleted.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: `Could not delete ${collectionName.slice(0, -1)}.` });
        } finally {
            setDeletingItem(null);
        }
    };

    // Edit functions
    const openEditModal = (item: EditableItem) => {
        setEditingItem(item);
        setIsEditModalOpen(true);
    };

    const handleUpdateItem = async (collectionName: string) => {
        if (!editingItem) return;
        
        try {
            const { id, ...data } = editingItem;
            await updateDoc(doc(db, collectionName, id), data);
            toast({ title: 'Success', description: 'Item updated successfully.' });
            setIsEditModalOpen(false);
            setEditingItem(null);
            fetchAllData();
        } catch (error) {
            console.error('Error updating item:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update item.' });
        }
    };

  const renderEditForm = () => {
    if (!editingItem) return null;
    
    // A bit of type guarding to determine what form to render
    if ('title' in editingItem && 'content' in editingItem) { // BlogPost
        return <>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.imageUrl} onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} rows={10} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('blogPosts')}>Save Changes</Button></DialogFooter>
        </>;
    }
    if ('name' in editingItem && 'rank' in editingItem) { // RosterMember
        return <>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Game</Label><Input value={editingItem.game} onChange={e => setEditingItem({ ...editingItem, game: e.target.value })} /></div>
                <div className="space-y-2"><Label>Rank</Label><Input value={editingItem.rank} onChange={e => setEditingItem({ ...editingItem, rank: e.target.value })} /></div>
                <div className="space-y-2"><Label>Role</Label><Input value={editingItem.role} onChange={e => setEditingItem({ ...editingItem, role: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Server</Label><Input value={editingItem.server} onChange={e => setEditingItem({ ...editingItem, server: e.target.value })} /></div>
            <div className="space-y-2"><Label>Avatar URL</Label><Input value={editingItem.avatarUrl} onChange={e => setEditingItem({ ...editingItem, avatarUrl: e.target.value })} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('roster')}>Save Changes</Button></DialogFooter>
        </>;
    }
    if ('author' in editingItem) { // Announcement
        return <>
            <div className="space-y-2"><Label>Author</Label><Input value={editingItem.author} onChange={e => setEditingItem({ ...editingItem, author: e.target.value })} /></div>
            <div className="space-y-2"><Label>Author PFP URL</Label><Input value={editingItem.authorImageUrl} onChange={e => setEditingItem({ ...editingItem, authorImageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={editingItem.content} onChange={e => setEditingItem({ ...editingItem, content: e.target.value })} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('announcements')}>Save Changes</Button></DialogFooter>
        </>;
    }
    if ('name' in editingItem && 'imageUrl' in editingItem) { // Game
         return <>
            <div className="space-y-2"><Label>Game Name</Label><Input value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.imageUrl} onChange={e => setEditingItem({ ...editingItem, imageUrl: e.target.value })} /></div>
            <div className="space-y-2"><Label>Image Hint</Label><Input value={editingItem.hint} onChange={e => setEditingItem({ ...editingItem, hint: e.target.value })} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('games')}>Save Changes</Button></DialogFooter>
        </>;
    }
    if ('src' in editingItem && 'alt' in editingItem && 'hint' in editingItem) { // Could be HeroImage or GalleryImage. We need a way to distinguish.
        const collectionName = 'alt' in editingItem && editingItem.alt.includes('slide') ? 'heroImages' : 'galleryImages';
         if ('alt' in editingItem && editingItem.alt.includes('slide')) { // Hero Image
            return <>
                <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.src} onChange={e => setEditingItem({ ...editingItem, src: e.target.value })} /></div>
                <div className="space-y-2"><Label>Alt Text</Label><Input value={editingItem.alt} onChange={e => setEditingItem({ ...editingItem, alt: e.target.value })} /></div>
                <div className="space-y-2"><Label>Image Hint</Label><Input value={editingItem.hint} onChange={e => setEditingItem({ ...editingItem, hint: e.target.value })} /></div>
                <DialogFooter><Button onClick={() => handleUpdateItem('heroImages')}>Save Changes</Button></DialogFooter>
            </>;
        } else { // Gallery Image
             return <>
                <div className="space-y-2"><Label>Image URL</Label><Input value={editingItem.src} onChange={e => setEditingItem({ ...editingItem, src: e.target.value })} /></div>
                <div className="space-y-2"><Label>Alt Text</Label><Input value={editingItem.alt} onChange={e => setEditingItem({ ...editingItem, alt: e.target.value })} /></div>
                <div className="space-y-2"><Label>Image Hint</Label><Input value={editingItem.hint} onChange={e => setEditingItem({ ...editingItem, hint: e.target.value })} /></div>
                <DialogFooter><Button onClick={() => handleUpdateItem('galleryImages')}>Save Changes</Button></DialogFooter>
            </>;
        }
    }
     if ('year' in editingItem) { // TimelineEvent
        return <>
            <div className="space-y-2"><Label>Year</Label><Input value={editingItem.year} onChange={e => setEditingItem({ ...editingItem, year: e.target.value })} /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('timelineEvents')}>Save Changes</Button></DialogFooter>
        </>;
    }
    if ('title' in editingItem && 'description' in editingItem) { // CoreValue
        return <>
            <div className="space-y-2"><Label>Title</Label><Input value={editingItem.title} onChange={e => setEditingItem({ ...editingItem, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} /></div>
            <DialogFooter><Button onClick={() => handleUpdateItem('coreValues')}>Save Changes</Button></DialogFooter>
        </>;
    }
    return <p>This item cannot be edited.</p>;
  };

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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               {renderEditForm()}
            </div>
        </DialogContent>
    </Dialog>


    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Admin Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage your website's content from here.</p>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="values">Values</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="blog">
             <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Blog Posts</CardTitle><CardDescription>Add, edit, or delete blog posts.</CardDescription></CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Post</h3>
                             <form className="space-y-4" onSubmit={handleAddPost}>
                                <div><Label htmlFor="post-title">Title</Label><Input id="post-title" placeholder="Enter post title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required /></div>
                                <div><Label htmlFor="post-tags">Category</Label><Input id="post-tags" placeholder="e.g. News, Update, Tutorial" value={newPost.category} onChange={(e) => setNewPost({...newPost, category: e.target.value})} required /></div>
                                <div><Label htmlFor="post-image-url">Image URL (Optional)</Label><Input id="post-image-url" type="text" placeholder="https://your-image-url.com/image.png" value={newPost.imageUrl} onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})} /></div>
                                <div><Label htmlFor="post-content">Content</Label><Textarea id="post-content" placeholder="Write your blog post content here..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required rows={10} /></div>
                                <Button type="submit" variant="primary">Add Post</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Existing Posts</h3>
                             <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {blogPosts.map((post) => (
                                <div key={post.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                                    <p className="font-medium">{post.title}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(post)}><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => setDeletingItem({collectionName: 'blogPosts', id: post.id})}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roster">
             <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Clan Roster</CardTitle><CardDescription>Add or remove members from the clan roster.</CardDescription></CardHeader>
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
                             <div className="max-h-96 overflow-y-auto"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Rank</TableHead><TableHead>Game</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                                {roster.map((member) => (<TableRow key={member.id}><TableCell>{member.name}</TableCell><TableCell>{member.rank}</TableCell><TableCell>{member.game}</TableCell><TableCell><Badge variant="secondary">{member.role}</Badge></TableCell><TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(member)}><Edit className="h-4 w-4"/></Button>
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
                             <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {announcements.map((ann) => (
                                <div key={ann.id} className="flex justify-between items-start bg-background/50 p-3 rounded-lg">
                                    <div><p className="font-bold text-sm">{ann.author}</p><p className="text-sm text-muted-foreground">{ann.content}</p></div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(ann)}><Edit className="h-4 w-4"/></Button>
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

          <TabsContent value="games">
              <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Games</CardTitle><CardDescription>Add or remove games from the homepage.</CardDescription></CardHeader>
                <CardContent>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Game</h3>
                             <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'games', newGame, () => setNewGame({ name: '', imageUrl: '', hint: '' }))}>
                                <div><Label htmlFor="game-name">Game Name</Label><Input id="game-name" placeholder="e.g., Valorant" value={newGame.name} onChange={(e) => setNewGame({...newGame, name: e.target.value})} required /></div>
                                <div><Label htmlFor="game-image-url">Image URL</Label><Input id="game-image-url" type="text" placeholder="https://your-image-url.com/image.png" value={newGame.imageUrl} onChange={(e) => setNewGame({...newGame, imageUrl: e.target.value})} required/></div>
                                <div><Label htmlFor="game-hint">Image Hint</Label><Input id="game-hint" placeholder="e.g., valorant agent" value={newGame.hint} onChange={(e) => setNewGame({...newGame, hint: e.target.value})} required /></div>
                                <Button variant="primary" type="submit">Add Game</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Games</h3>
                             <div className="space-y-4 max-h-96 overflow-y-auto pr-4 grid grid-cols-2 gap-4">
                                {games.map((game) => (
                                <div key={game.id} className="relative group">
                                    <Image src={game.imageUrl} alt={game.name} width={200} height={266} className="rounded-lg w-full object-cover aspect-[3/4]" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="font-bold text-sm text-white mb-2">{game.name}</p>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openEditModal(game)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="destructive" size="icon" onClick={() => setDeletingItem({collectionName: 'games', id: game.id})}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="hero">
              <Card className="bg-card mt-6">
                  <CardHeader><CardTitle>Manage Hero Images</CardTitle><CardDescription>Add or remove images from the homepage slideshow.</CardDescription></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Hero Image</h3>
                              <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'heroImages', newHeroImage, () => setNewHeroImage({ src: '', alt: '', hint: '' }))}>
                                  <div><Label htmlFor="hero-src">Image URL</Label><Input id="hero-src" value={newHeroImage.src} onChange={(e) => setNewHeroImage({ ...newHeroImage, src: e.target.value })} required /></div>
                                  <div><Label htmlFor="hero-alt">Alt Text</Label><Input id="hero-alt" value={newHeroImage.alt} onChange={(e) => setNewHeroImage({ ...newHeroImage, alt: e.target.value })} required /></div>
                                  <div><Label htmlFor="hero-hint">Image Hint</Label><Input id="hero-hint" value={newHeroImage.hint} onChange={(e) => setNewHeroImage({ ...newHeroImage, hint: e.target.value })} required /></div>
                                  <Button variant="primary" type="submit">Add Image</Button>
                              </form>
                          </div>
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Hero Images</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {heroImages.map((img) => (
                                      <div key={img.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg">
                                          <Image src={img.src} alt={img.alt} width={100} height={56} className="rounded-md object-cover" />
                                          <span className="truncate ml-4 flex-grow">{img.alt}</span>
                                           <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(img)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingItem({collectionName: 'heroImages', id: img.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="timeline">
              <Card className="bg-card mt-6">
                  <CardHeader><CardTitle>Manage Timeline Events</CardTitle><CardDescription>Manage the timeline on the About page.</CardDescription></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                           <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Event</h3>
                              <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'timelineEvents', newTimelineEvent, () => setNewTimelineEvent({ year: '', title: '', description: '' }))}>
                                  <div><Label htmlFor="event-year">Year</Label><Input id="event-year" value={newTimelineEvent.year} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, year: e.target.value })} required /></div>
                                  <div><Label htmlFor="event-title">Title</Label><Input id="event-title" value={newTimelineEvent.title} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, title: e.target.value })} required /></div>
                                  <div><Label htmlFor="event-desc">Description</Label><Textarea id="event-desc" value={newTimelineEvent.description} onChange={(e) => setNewTimelineEvent({ ...newTimelineEvent, description: e.target.value })} required /></div>
                                  <Button variant="primary" type="submit">Add Event</Button>
                              </form>
                          </div>
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Events</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {timelineEvents.map((event) => (
                                      <div key={event.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg">
                                          <span>{event.year} - {event.title}</span>
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(event)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingItem({collectionName: 'timelineEvents', id: event.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="values">
              <Card className="bg-card mt-6">
                  <CardHeader><CardTitle>Manage Core Values</CardTitle><CardDescription>Manage the core values on the About page.</CardDescription></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                           <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Value</h3>
                              <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'coreValues', newCoreValue, () => setNewCoreValue({ title: '', description: '' }))}>
                                  <div><Label htmlFor="value-title">Title</Label><Input id="value-title" value={newCoreValue.title} onChange={(e) => setNewCoreValue({ ...newCoreValue, title: e.target.value })} required /></div>
                                  <div><Label htmlFor="value-desc">Description</Label><Textarea id="value-desc" value={newCoreValue.description} onChange={(e) => setNewCoreValue({ ...newCoreValue, description: e.target.value })} required /></div>
                                  <Button variant="primary" type="submit">Add Value</Button>
                              </form>
                          </div>
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Values</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {coreValues.map((value) => (
                                      <div key={value.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg">
                                          <span>{value.title}</span>
                                           <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(value)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingItem({collectionName: 'coreValues', id: value.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
          <TabsContent value="gallery">
              <Card className="bg-card mt-6">
                  <CardHeader><CardTitle>Manage Gallery Images</CardTitle><CardDescription>Manage the gallery on the About page.</CardDescription></CardHeader>
                  <CardContent>
                      <div className="grid md:grid-cols-2 gap-8">
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Gallery Image</h3>
                              <form className="space-y-4" onSubmit={(e) => handleAddItem(e, 'galleryImages', newGalleryImage, () => setNewGalleryImage({ src: '', alt: '', hint: '' }))}>
                                  <div><Label htmlFor="gallery-src">Image URL</Label><Input id="gallery-src" value={newGalleryImage.src} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, src: e.target.value })} required /></div>
                                  <div><Label htmlFor="gallery-alt">Alt Text</Label><Input id="gallery-alt" value={newGalleryImage.alt} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, alt: e.target.value })} required /></div>
                                  <div><Label htmlFor="gallery-hint">Image Hint</Label><Input id="gallery-hint" value={newGalleryImage.hint} onChange={(e) => setNewGalleryImage({ ...newGalleryImage, hint: e.target.value })} required /></div>
                                  <Button variant="primary" type="submit">Add Image</Button>
                              </form>
                          </div>
                          <div>
                              <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Gallery Images</h3>
                              <div className="space-y-2 max-h-96 overflow-y-auto pr-4">
                                  {galleryImages.map((img) => (
                                      <div key={img.id} className="flex items-center justify-between bg-background/50 p-2 rounded-lg">
                                          <Image src={img.src} alt={img.alt} width={80} height={80} className="rounded-md object-cover aspect-square" />
                                          <span className="truncate ml-4 flex-grow">{img.alt}</span>
                                          <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => openEditModal(img)}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeletingItem({collectionName: 'galleryImages', id: img.id})}><Trash2 className="h-4 w-4" /></Button>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>
           <TabsContent value="settings">
              <Card className="bg-card mt-6">
                <CardHeader><CardTitle>Manage Site Settings</CardTitle><CardDescription>Update global settings like footer links.</CardDescription></CardHeader>
                <CardContent>
                    <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateFooterSettings}>
                        <h3 className="text-lg font-semibold border-b pb-2">Footer Settings</h3>
                         <div className="space-y-2">
                            <Label htmlFor="developer-name">Developer Name</Label>
                            <Input id="developer-name" value={footerSettings.developerName} onChange={(e) => setFooterSettings({ ...footerSettings, developerName: e.target.value })} placeholder="e.g., Fourtuna" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="developer-url">Developer URL</Label>
                            <Input id="developer-url" value={footerSettings.developerUrl} onChange={(e) => setFooterSettings({ ...footerSettings, developerUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        
                        <h4 className="text-md font-semibold pt-4">Social Media Links</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="twitter-url">Twitter URL</Label>
                                <Input id="twitter-url" value={footerSettings.twitterUrl} onChange={(e) => setFooterSettings({ ...footerSettings, twitterUrl: e.target.value })} placeholder="https://twitter.com/..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="discord-url">Discord URL</Label>
                                <Input id="discord-url" value={footerSettings.discordUrl} onChange={(e) => setFooterSettings({ ...footerSettings, discordUrl: e.target.value })} placeholder="https://discord.gg/..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="youtube-url">YouTube URL</Label>
                                <Input id="youtube-url" value={footerSettings.youtubeUrl} onChange={(e) => setFooterSettings({ ...footerSettings, youtubeUrl: e.target.value })} placeholder="https://youtube.com/..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="twitch-url">Twitch URL</Label>
                                <Input id="twitch-url" value={footerSettings.twitchUrl} onChange={(e) => setFooterSettings({ ...footerSettings, twitchUrl: e.target.value })} placeholder="https://twitch.tv/..." />
                            </div>
                        </div>

                        <Button type="submit" variant="primary">Save Settings</Button>
                    </form>
                </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
    </>
  );
}
