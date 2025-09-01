"use client";

import Link from "next/link";
import { FantomIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, ShieldCheck, LogOut, X } from "lucide-react";
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
    { href: "/#news", label: "News" },
    { href: "/#teams", label: "Teams" },
    { href: "/blog", label: "Blog" },
    { href: "/#roster", label: "Roster" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <FantomIcon className="w-24 h-auto" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-primary tracking-wider ${pathname === link.href ? 'text-primary' : 'text-foreground/80'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
            {user && (
              <Link href="/admin">
                <Button variant="outline" size="icon" className="border-primary text-primary"><ShieldCheck /></Button>
              </Link>
            )}
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l-white/10">
                  <div className="flex justify-between items-center mb-8">
                     <Link href="/" className="flex items-center gap-2">
                       <FantomIcon className="w-24 h-auto" />
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
                        key={link.href}
                        href={link.href}
                        className="text-2xl font-bold uppercase tracking-wider"
                      >
                        {link.label}
                      </Link>
                    ))}
                     <div className="mt-auto pt-4 border-t border-border">
                        {user ? (
                            <>
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
                            </>
                          ) : (
                             
                                 <Button asChild variant="ghost" className="justify-start w-full">
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
