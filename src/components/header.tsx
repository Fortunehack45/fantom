
"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";
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
    { href: "/#game", label: "Game" },
    { href: "/#team", label: "Team" },
    { href: "/#roadmap", label: "Roadmap" },
    { href: "/#staking", label: "Staking" },
    { href: "/#marketplace", label: "Marketplace" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center px-4">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold font-headline uppercase">
            Alica
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
        <div className="flex flex-1 items-center justify-end gap-4">
           <Button asChild variant="primary" className="hidden sm:inline-flex">
                 <Link href="#">Play Now</Link>
           </Button>
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
                <Gamepad2 className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold font-headline uppercase">
                  Alica
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
                 {user ? (
                     <Button variant="ghost" onClick={handleLogout} className="justify-start mt-4">
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  ) : (
                     <Button asChild variant="ghost" className="justify-start mt-4">
                        <Link href="/admin/login">Login</Link>
                      </Button>
                  )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
