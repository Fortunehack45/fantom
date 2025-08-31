
"use client";

import Link from "next/link";
import { GhostIcon } from "@/components/icons";
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
    { href: "/blog", label: "Blog" },
    { href: "/#roster", label: "Clan Roster" },
    { href: "/#recruitment", label: "Recruitment" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <GhostIcon className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold font-headline uppercase">
            Fantom eSport
          </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary text-foreground/80"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/admin"
              className="flex items-center gap-2 transition-colors hover:text-primary text-foreground/80"
            >
              <ShieldCheck className="h-4 w-4" />
              Clan Master
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          {user ? (
             <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/admin/login">Login</Link>
              </Button>
              <Button asChild variant="primary">
                 <Link href="/signup">Sign Up</Link>
              </Button>
            </>
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
                 <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
              </SheetHeader>
              <Link href="/" className="flex items-center gap-2 mb-8">
                <GhostIcon className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold font-headline uppercase">
                  Fantom eSport
                </span>
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
                {user && (
                    <Link
                        href="/admin"
                        className="text-lg font-medium flex items-center gap-2"
                    >
                        <ShieldCheck className="h-5 w-5" />
                        Clan Master
                    </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
