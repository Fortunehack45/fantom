"use client";

import Link from "next/link";
import { TsmIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, ShieldCheck, LogOut, X, ChevronDown, TwitterIcon, TwitchIcon, YoutubeIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/');
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log you out. Please try again." });
    }
  };

  const navLinks = [
    { href: "/#teams", label: "Teams" },
    { href: "#", label: "Facility" },
    { href: "/#news", label: "News" },
    { href: "#", label: "Partners" },
    { href: "/#shop", label: "Store" },
    { href: "#", label: "More" },
    { href: "#", label: "Contact" },
  ];

  return (
    <header className="absolute top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <TsmIcon className="w-16 h-auto text-white" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors hover:text-white pb-1 border-b-2 ${pathname === link.href || (link.href === '/#news' && (pathname === '/' || pathname.startsWith('/blog'))) ? 'text-white border-white' : 'text-foreground/80 border-transparent'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
                <TwitterIcon className="w-5 h-5 text-foreground/80 hover:text-white transition-colors" />
                <TwitchIcon className="w-5 h-5 text-foreground/80 hover:text-white transition-colors" />
                <YoutubeIcon className="w-5 h-5 text-foreground/80 hover:text-white transition-colors" />
            </div>
            {user && (
              <Link href="/admin">
                <Button variant="outline" size="icon" className="border-primary text-primary"><ShieldCheck /></Button>
              </Link>
            )}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l-white/10">
                  <div className="flex justify-between items-center mb-8">
                     <Link href="/" className="flex items-center gap-2">
                       <TsmIcon className="w-16 h-auto text-white" />
                    </Link>
                    <SheetTrigger asChild>
                       <Button variant="ghost" size="icon">
                        <X />
                        <span className="sr-only">Close Menu</span>
                      </Button>
                    </SheetTrigger>
                  </div>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="text-2xl font-bold uppercase tracking-wider text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                     <div className="mt-auto pt-4 border-t border-border">
                        {user ? (
                            <>
                                 <Link
                                    href="/admin"
                                    className="text-lg font-medium flex items-center gap-2 mb-2 text-white"
                                >
                                    <ShieldCheck className="h-5 w-5" />
                                    Clan Master
                                </Link>
                                 <Button variant="ghost" onClick={handleLogout} className="justify-start w-full text-white">
                                  <LogOut className="mr-2 h-5 w-5" />
                                  Logout
                                </Button>
                            </>
                          ) : (
                             
                                 <Button asChild variant="ghost" className="justify-start w-full text-white">
                                    <Link href="/admin/login">Login</Link>
                                  </Button>
                             
                          )}
                     </div>
                  </nav>
                </SheetContent>
              </Sheet>
        </div>
      </div>
    </header>
  );
}
