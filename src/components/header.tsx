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
import { Menu } from "lucide-react";

export function Header() {
  const navLinks = [
    { href: "#servers", label: "Servers Overview" },
    { href: "#blog", label: "Blog" },
    { href: "#roster", label: "Clan Roster" },
    { href: "#recruitment", label: "Recruitment" },
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
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button variant="accent">Discord</Button>
          <Button variant="primary">Join Us</Button>
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
