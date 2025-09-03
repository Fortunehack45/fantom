
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, LogOut, Shield, User as UserIcon, PlusCircle, Video, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc } from "firebase/firestore";

const ADMIN_EMAIL = 'fortunedomination@gmail.com';

interface SiteSettings {
    discordUrl?: string;
}

export function Header() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
     const fetchSettings = async () => {
        try {
            const docRef = doc(db, "siteSettings", "footer");
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data() as SiteSettings);
            }
        } catch (error) {
            console.error("Error fetching header settings:", error);
        }
    };
    fetchSettings();
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "There was an error logging you out." });
    }
  };

  const getUsername = (user: User | null) => {
      if (!user) return "User";
      return user.displayName || user.email?.split('@')[0];
  }

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "News" },
    { href: "/shorts", label: "Shorts" },
    { href: "/messages", label: "Messages" },
    { href: "/roster", label: "Roster" },
    { href: "/announcements", label: "Announcements" },
    { href: "/about", label: "About" },
  ];

  const headerClasses = "sticky top-0 z-50 w-full border-b border-b-primary/20 bg-background/95 backdrop-blur-sm";


  return (
    <header className={headerClasses}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl font-bold uppercase text-white tracking-widest font-headline">Fantom eSport</span>
            </Link>
        </div>
        
        <nav className="hidden lg:flex flex-[2] justify-center items-center gap-6 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors text-white/80 hover:text-primary hover:drop-shadow-primary ${pathname === link.href ? 'text-primary drop-shadow-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2">
             <Link href={settings.discordUrl || '#'} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="hidden lg:flex">
                    Discord
                </Button>
            </Link>
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="primary" size="icon" className="hidden lg:flex rounded-full">
                      <PlusCircle />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/blog/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/shorts/create">
                        <Video className="mr-2 h-4 w-4" />
                        New Short
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.email?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">{getUsername(user)}</p>
                              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/profile">
                               <UserIcon className="mr-2 h-4 w-4" />
                               <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>
                       {user.email === ADMIN_EMAIL && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin">
                               <Shield className="mr-2 h-4 w-4" />
                               <span>Admin</span>
                            </Link>
                        </DropdownMenuItem>
                       )}
                      <DropdownMenuItem onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/admin/login">
                  <Button variant="secondary" className="hidden lg:flex">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" className="hidden lg:flex">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l-primary/20">
                   <SheetHeader>
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <div className="flex justify-between items-center mb-8">
                      <Link href="/" className="flex items-center gap-2">
                          <span className="text-2xl font-bold uppercase text-white tracking-widest font-headline">Fantom eSport</span>
                      </Link>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <X />
                          <span className="sr-only">Close Menu</span>
                        </Button>
                      </SheetTrigger>
                    </div>
                  </SheetHeader>
                  <nav className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-2xl font-bold uppercase tracking-wider text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>
                  <div className="mt-8 flex flex-col gap-4">
                     <Link href={settings.discordUrl || '#'} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" size="lg" className="w-full">
                            Discord
                        </Button>
                     </Link>
                    {user ? (
                      <>
                        <Link href="/blog/create" className="w-full">
                            <Button variant="primary" size="lg" className="w-full">
                                Create Post
                            </Button>
                        </Link>
                         <Link href="/shorts/create" className="w-full">
                            <Button variant="primary" size="lg" className="w-full">
                                Create Short
                            </Button>
                        </Link>
                        <Link href="/profile" className="w-full">
                            <Button variant="secondary" size="lg" className="w-full">
                                Profile
                            </Button>
                        </Link>
                        {user.email === ADMIN_EMAIL && (
                            <Link href="/admin" className="w-full">
                                <Button variant="secondary" size="lg" className="w-full">
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <Button onClick={handleLogout} variant="destructive" size="lg" className="w-full">
                            Logout
                        </Button>
                      </>
                    ) : (
                      <>
                         <Link href="/admin/login" className="w-full">
                            <Button variant="secondary" size="lg" className="w-full">
                                Login
                            </Button>
                         </Link>
                         <Link href="/signup" className="w-full">
                            <Button variant="primary" size="lg" className="w-full">
                               Sign Up
                            </Button>
                         </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
        </div>
      </div>
    </header>
  );
}
