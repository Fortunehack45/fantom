
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
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "News" },
    { href: "/#clan-roster", label: "Roster" },
    { href: "/#recruitment", label: "Recruitment" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-b-primary/20 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-bold uppercase text-white tracking-widest font-headline">Fantom eSport</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors text-white/80 hover:text-primary ${pathname === link.href ? 'text-primary' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden lg:flex">
                Discord
            </Button>
             <Link href="/admin/login">
                <Button variant="secondary" className="hidden lg:flex">
                    Admin
                </Button>
            </Link>
            <Button variant="primary" className="hidden lg:flex">
                Join Us
            </Button>
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
                     <Link href="/admin/login" className="text-2xl font-bold uppercase tracking-wider text-white">
                        Admin
                    </Link>
                  </nav>
                  <div className="mt-8 flex flex-col gap-4">
                    <Button variant="outline" size="lg" className="w-full">
                        Discord
                    </Button>
                    <Button variant="primary" size="lg" className="w-full">
                        Join Us
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
        </div>
      </div>
    </header>
  );
}
