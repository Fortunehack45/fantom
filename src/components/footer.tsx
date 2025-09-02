
'use client';

import Link from "next/link";
import { GhostIcon } from "./icons";
import { Button } from "./ui/button";
import { Twitter, Youtube, Twitch } from 'lucide-react';
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36">
        <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.38,96.36,77.7,77.7,0,0,0,39.6,90.4a67.73,67.73,0,0,1-5.18-4.51,68.28,68.28,0,0,0-2.85-2.09,77.2,77.2,0,0,1-.25-2.22,70.52,70.52,0,0,1,18.7-2.19,65.6,65.6,0,0,1-4.7,5.57,66.3,66.3,0,0,0-3.36,3.45,77.31,77.31,0,0,0,6.2,5.92,105.22,105.22,0,0,0,32.37-16.15c4.25-2.8,7.92-6,11-9.56a73.45,73.45,0,0,0,6.43-10.22,105.38,105.38,0,0,0-1.57-26.07C128.85,56.57,124.3,32.65,107.7,8.07ZM42.45,65.69C36.67,65.69,32,60,32,53s4.67-12.7,10.45-12.7S52.9,46,52.9,53,48.23,65.69,42.45,65.69Zm42.24,0C78.91,65.69,74.24,60,74.24,53s4.67-12.7,10.45-12.7S95.14,46,95.14,53,90.47,65.69,84.69,65.69Z"/>
    </svg>
);

interface SiteSettings {
    twitterUrl?: string;
    discordUrl?: string;
    youtubeUrl?: string;
    twitchUrl?: string;
    developerName?: string;
    developerUrl?: string;
}

export function Footer() {
    const [settings, setSettings] = useState<SiteSettings>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, "siteSettings", "footer");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data() as SiteSettings);
                }
            } catch (error) {
                console.error("Error fetching footer settings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <footer className="bg-card border-t border-primary/20">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <Link href="/" className="flex items-center gap-2">
                        <GhostIcon className="w-8 h-8 text-primary"/>
                        <span className="text-xl font-bold uppercase text-white tracking-widest font-headline">Fantom eSport</span>
                    </Link>
                    {!loading && Object.keys(settings).length > 0 && (
                        <div className="flex items-center gap-2 md:gap-4">
                            {settings.twitterUrl && (
                                <Link href={settings.twitterUrl} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <Twitter className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {settings.discordUrl && (
                                <Link href={settings.discordUrl} aria-label="Discord" target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <DiscordIcon className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {settings.youtubeUrl && (
                                <Link href={settings.youtubeUrl} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <Youtube className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                            {settings.twitchUrl && (
                                <Link href={settings.twitchUrl} aria-label="Twitch" target="_blank" rel="noopener noreferrer">
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                        <Twitch className="h-5 w-5" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-8 pt-6 border-t border-primary/10 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} Fantom eSport - All rights reserved.</p>
                    {settings.developerName && (
                        <p>Developed By <Link href={settings.developerUrl || '#'} className="font-semibold text-primary hover:underline" target="_blank" rel="noopener noreferrer">{settings.developerName}</Link></p>
                    )}
                </div>
            </div>
        </footer>
    );
}

    