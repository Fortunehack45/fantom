
'use client';

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
}

interface RosterMember {
    id: string;
    name: string;
    role: string;
    server: string;
}

interface Announcement {
    id: string;
    author: string;
    authorImageUrl?: string;
    content: string;
}

export default function AdminPage() {
    const { toast } = useToast();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [newPostImage, setNewPostImage] = useState<File | null>(null);

    const [newMember, setNewMember] = useState({ name: '', role: '', server: '' });

    const [newAnnouncement, setNewAnnouncement] = useState({ author: '', content: '' });
    const [newAnnouncementImage, setNewAnnouncementImage] = useState<File | null>(null);
    
    const [isUploading, setIsUploading] = useState(false);

    const fetchBlogPosts = async () => {
        const querySnapshot = await getDocs(collection(db, "blogPosts"));
        const posts: BlogPost[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
        setBlogPosts(posts);
    };

    const fetchRoster = async () => {
        const querySnapshot = await getDocs(collection(db, "roster"));
        const rosterData: RosterMember[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RosterMember));
        setRoster(rosterData);
    };

    const fetchAnnouncements = async () => {
        const querySnapshot = await getDocs(collection(db, "announcements"));
        const announcementsData: Announcement[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(announcementsData);
    };

    useEffect(() => {
        fetchBlogPosts();
        fetchRoster();
        fetchAnnouncements();
    }, []);

    const uploadImage = async (file: File, path: string): Promise<string> => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    };

    // Blog Post Handlers
    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPost.title && newPost.content) {
            setIsUploading(true);
            try {
                let imageUrl = `https://picsum.photos/400/250?random=${Date.now()}`;
                if (newPostImage) {
                    imageUrl = await uploadImage(newPostImage, `blog_images/${Date.now()}_${newPostImage.name}`);
                }
                
                await addDoc(collection(db, "blogPosts"), { 
                    ...newPost, 
                    imageUrl
                });

                setNewPost({ title: '', content: '' });
                setNewPostImage(null);
                fetchBlogPosts();
                 toast({ title: "Success", description: "Blog post added." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not add blog post." });
            } finally {
                setIsUploading(false);
            }
        }
    };
    const handleDeletePost = async (id: string) => {
        try {
            await deleteDoc(doc(db, "blogPosts", id));
            fetchBlogPosts();
            toast({ title: "Success", description: "Blog post deleted." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete blog post." });
        }
    };

    // Roster Handlers
    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMember.name && newMember.role && newMember.server) {
            try {
                await addDoc(collection(db, "roster"), newMember);
                setNewMember({ name: '', role: '', server: '' });
                fetchRoster();
                toast({ title: "Success", description: "Roster member added." });
            } catch (error) {
                 toast({ variant: "destructive", title: "Error", description: "Could not add roster member." });
            }
        }
    };
    const handleDeleteMember = async (id: string) => {
        try {
            await deleteDoc(doc(db, "roster", id));
            fetchRoster();
            toast({ title: "Success", description: "Roster member deleted." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete roster member." });
        }
    };

    // Announcement Handlers
    const handleAddAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newAnnouncement.author && newAnnouncement.content) {
            setIsUploading(true);
            try {
                let authorImageUrl = `https://picsum.photos/40/40?random=${Date.now()}`;
                 if (newAnnouncementImage) {
                    authorImageUrl = await uploadImage(newAnnouncementImage, `author_images/${Date.now()}_${newAnnouncementImage.name}`);
                }
                await addDoc(collection(db, "announcements"), {
                    ...newAnnouncement,
                    authorImageUrl
                });
                setNewAnnouncement({ author: '', content: ''});
                setNewAnnouncementImage(null);
                fetchAnnouncements();
                toast({ title: "Success", description: "Announcement added." });
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not add announcement." });
            } finally {
                setIsUploading(false);
            }
        }
    };
    const handleDeleteAnnouncement = async (id: string) => {
       try {
            await deleteDoc(doc(db, "announcements", id));
            fetchAnnouncements();
            toast({ title: "Success", description: "Announcement deleted." });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not delete announcement." });
        }
    };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-headline font-bold">
                Clan Master Panel
            </h1>
            <p className="text-muted-foreground mt-2">Manage your website's content from here.</p>
        </div>

        <div className="space-y-12">
            {/* Manage Blog Posts */}
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Manage Blog Posts</CardTitle>
                    <CardDescription>Add, edit, or delete blog posts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Post</h3>
                             <form className="space-y-4" onSubmit={handleAddPost}>
                                <div>
                                    <Label htmlFor="post-title">Title</Label>
                                    <Input id="post-title" placeholder="Enter post title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} required />
                                </div>
                                <div>
                                    <Label htmlFor="post-image">Image</Label>
                                    <Input id="post-image" type="file" accept="image/*" onChange={(e) => setNewPostImage(e.target.files ? e.target.files[0] : null)} />
                                </div>
                                <div>
                                    <Label htmlFor="post-content">Content</Label>
                                    <Textarea id="post-content" placeholder="Write your blog post content here..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} required />
                                </div>
                                <Button type="submit" variant="primary" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Add Post'}</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Existing Posts</h3>
                             <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {blogPosts.map((post) => (
                                <div key={post.id} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                                    <p className="font-medium">{post.title}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeletePost(post.id)}><Trash2 className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Manage Clan Roster */}
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Manage Clan Roster</CardTitle>
                    <CardDescription>Add or remove members from the clan roster.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Add New Member</h3>
                             <form className="space-y-4" onSubmit={handleAddMember}>
                                <div>
                                    <Label htmlFor="member-name">Name</Label>
                                    <Input id="member-name" placeholder="Enter member's name" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} required/>
                                </div>
                                <div>
                                    <Label htmlFor="member-role">Role</Label>
                                    <Input id="member-role" placeholder="e.g., Legendary, Pro, New Member" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} required/>
                                </div>
                                 <div>
                                    <Label htmlFor="member-server">Server</Label>
                                    <Input id="member-server" placeholder="Enter server ID" value={newMember.server} onChange={(e) => setNewMember({...newMember, server: e.target.value})} required/>
                                </div>
                                <Button variant="primary" type="submit">Add Member</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Roster</h3>
                             <div className="max-h-96 overflow-y-auto">
                                 <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Server</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roster.map((member) => (
                                            <TableRow key={member.id}>
                                                <TableCell>{member.name}</TableCell>
                                                <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                                <TableCell>{member.server}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteMember(member.id)}><Trash2 className="h-4 w-4"/></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            {/* Manage Discord Announcements */}
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Manage Discord Announcements</CardTitle>
                    <CardDescription>Create or delete Discord announcements.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid md:grid-cols-2 gap-8">
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">New Announcement</h3>
                             <form className="space-y-4" onSubmit={handleAddAnnouncement}>
                                <div>
                                    <Label htmlFor="ann-author">Author</Label>
                                    <Input id="ann-author" placeholder="@YourDiscordHandle" value={newAnnouncement.author} onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})} required />
                                </div>
                                <div>
                                    <Label htmlFor="ann-author-image">Author Profile Picture</Label>
                                    <Input id="ann-author-image" type="file" accept="image/*" onChange={(e) => setNewAnnouncementImage(e.target.files ? e.target.files[0] : null)} />
                                </div>
                                <div>
                                    <Label htmlFor="ann-content">Content</Label>
                                    <Textarea id="ann-content" placeholder="Write your announcement here..." value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required />
                                </div>
                                <Button variant="primary" type="submit" disabled={isUploading}>{isUploading ? 'Uploading...' : 'Add Announcement'}</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Announcements</h3>
                             <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                                {announcements.map((ann) => (
                                <div key={ann.id} className="flex justify-between items-start bg-background/50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-bold text-sm">{ann.author}</p>
                                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 flex-shrink-0" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

      </main>
      <Footer />
    </div>
  );
}
