
'use client';

import { useState } from "react";
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

export default function AdminPage() {
    const initialBlogPosts = [
        { title: "The Ultimate Guide to Winning", content: "Discover the strategies and tips from our pro players to dominate the competition and climb the ranks...", imageUrl: "https://picsum.photos/400/250" },
        { title: "New Season, New Goals", content: "The new season is upon us! Here's what we're aiming for as a clan and how you can get involved.", imageUrl: "https://picsum.photos/400/250" },
        { title: "Community Spotlight: ErnestoDKS412", content: "An interview with one of our most legendary members. Learn about their journey in Fantom eSport.", imageUrl: "https://picsum.photos/400/250" },
    ];

    const initialRoster = [
        { name: "ErnestoDKS412", role: "Legendary", server: "01Ernesto-5332" },
        { name: "PlayerTwo", role: "Pro", server: "01Ernesto-5332" },
        { name: "PlayerThree", role: "New Member", server: "practice-server.fantom.gg" },
    ];

    const initialAnnouncements = [
        { author: "@DukeGR4813", content: "New event announced! Check the events channel for more details and sign up now." },
        { author: "@Admin", content: "Weekly clan meeting this Friday at 8 PM CET. Be there!" },
    ];

    const [blogPosts, setBlogPosts] = useState(initialBlogPosts);
    const [roster, setRoster] = useState(initialRoster);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);

    const [newPost, setNewPost] = useState({ title: '', imageUrl: '', content: '' });
    const [newMember, setNewMember] = useState({ name: '', role: '', server: '' });
    const [newAnnouncement, setNewAnnouncement] = useState({ author: '', content: '' });

    // Blog Post Handlers
    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPost.title && newPost.content) {
            setBlogPosts([...blogPosts, { ...newPost, imageUrl: newPost.imageUrl || 'https://picsum.photos/400/250' }]);
            setNewPost({ title: '', imageUrl: '', content: '' });
        }
    };
    const handleDeletePost = (index: number) => {
        setBlogPosts(blogPosts.filter((_, i) => i !== index));
    };

    // Roster Handlers
    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMember.name && newMember.role && newMember.server) {
            setRoster([...roster, newMember]);
            setNewMember({ name: '', role: '', server: '' });
        }
    };
    const handleDeleteMember = (index: number) => {
        setRoster(roster.filter((_, i) => i !== index));
    };

    // Announcement Handlers
    const handleAddAnnouncement = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAnnouncement.author && newAnnouncement.content) {
            setAnnouncements([...announcements, newAnnouncement]);
            setNewAnnouncement({ author: '', content: '' });
        }
    };
    const handleDeleteAnnouncement = (index: number) => {
        setAnnouncements(announcements.filter((_, i) => i !== index));
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
                                    <Input id="post-title" placeholder="Enter post title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="post-image">Image URL</Label>
                                    <Input id="post-image" placeholder="https://picsum.photos/400/250" value={newPost.imageUrl} onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="post-content">Content</Label>
                                    <Textarea id="post-content" placeholder="Write your blog post content here..." value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} />
                                </div>
                                <Button type="submit" variant="primary">Add Post</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Existing Posts</h3>
                             <div className="space-y-4">
                                {blogPosts.map((post, index) => (
                                <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                                    <p className="font-medium">{post.title}</p>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeletePost(index)}><Trash2 className="h-4 w-4"/></Button>
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
                                    <Input id="member-name" placeholder="Enter member's name" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="member-role">Role</Label>
                                    <Input id="member-role" placeholder="e.g., Legendary, Pro, New Member" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} />
                                </div>
                                 <div>
                                    <Label htmlFor="member-server">Server</Label>
                                    <Input id="member-server" placeholder="Enter server ID" value={newMember.server} onChange={(e) => setNewMember({...newMember, server: e.target.value})} />
                                </div>
                                <Button variant="primary" type="submit">Add Member</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Current Roster</h3>
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
                                    {roster.map((member, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{member.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                            <TableCell>{member.server}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteMember(index)}><Trash2 className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                                    <Input id="ann-author" placeholder="@YourDiscordHandle" value={newAnnouncement.author} onChange={(e) => setNewAnnouncement({...newAnnouncement, author: e.target.value})} />
                                </div>
                                <div>
                                    <Label htmlFor="ann-content">Content</Label>
                                    <Textarea id="ann-content" placeholder="Write your announcement here..." value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} />
                                </div>
                                <Button variant="primary" type="submit">Add Announcement</Button>
                             </form>
                        </div>
                        <div>
                             <h3 className="text-lg font-semibold mb-4 border-b pb-2">Recent Announcements</h3>
                             <div className="space-y-4">
                                {announcements.map((ann, index) => (
                                <div key={index} className="flex justify-between items-start bg-background/50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-bold text-sm">{ann.author}</p>
                                        <p className="text-sm text-muted-foreground">{ann.content}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 flex-shrink-0" onClick={() => handleDeleteAnnouncement(index)}><Trash2 className="h-4 w-4"/></Button>
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

    
