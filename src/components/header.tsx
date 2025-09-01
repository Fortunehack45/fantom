
"use client";

import Link from "next/link";
import { DoomIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, ShieldCheck, LogOut } from "lucide-react";
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
    { href: "/#servers", label: "Servers Overview" },
    { href: "/#news", label: "News" },
    { href: "/blog", label: "Blog" },
    { href: "/#roster", label: "Clan Roster" },
    { href: "/#recruitment", label: "Recruitment" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <DoomIcon className="w-24 h-auto" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary text-foreground/80 tracking-wider"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
            <Button variant="secondary" className="hidden sm:inline-flex">Discord</Button>
            <Button variant="primary" className="hidden sm:inline-flex">Join Us</Button>
            {user && (
              <Link href="/admin">
                <Button variant="outline" size="icon"><ShieldCheck /></Button>
              </Link>
            )}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                  <Link href="/" className="flex items-center gap-2 mb-8">
                     <DoomIcon className="w-24 h-auto" />
                  </Link>
                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-lg font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="flex flex-col gap-2 mt-4">
                        <Button variant="secondary">Discord</Button>
                        <Button variant="primary">Join Us</Button>
                    </div>
                    {user ? (
                        <div className="mt-auto pt-4 border-t border-border">
                             <Link
                                href="/admin"
                                className="text-lg font-medium flex items-center gap-2 mb-2"
                            >
                                <ShieldCheck className="h-5 w-5" />
                                Clan Master
                            </Link>
                             <Button variant="ghost" onClick={handleLogout} className="justify-start w-full">
                              <LogOut className="mr-2 h-5 w-5" />
                              Logout
                            </Button>
                        </div>
                      ) : (
                         <div className="mt-auto pt-4 border-t border-border">
                             <Button asChild variant="ghost" className="justify-start w-full">
                                <Link href="/admin/login">Login</Link>
                              </Button>
                         </div>
                      )}
                  </nav>
                </SheetContent>
              </Sheet>
        </div>
      </div>
    </header>
  );
}
