"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Gamepad2, Play, X } from "lucide-react";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/#game", label: "Game" },
    { href: "/#teams", label: "Team" },
    { href: "#", label: "Roadmap" },
    { href: "#", label: "Staking" },
    { href: "/#marketplace", label: "Marketplace" },
  ];

  return (
    <header className="absolute top-0 z-50 w-full bg-gradient-to-b from-black/50 to-transparent">
      <div className="container mx-auto flex h-24 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold uppercase text-white tracking-widest font-headline">ALICA</span>
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors text-white/80 hover:text-white hover:text-shadow-[0_0_8px_hsl(var(--primary))] ${pathname === link.href ? 'text-primary text-shadow-[0_0_8px_hsl(var(--primary))]' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
            <Button variant="primary" className="hidden lg:flex btn-primary-glow">
                <Play className="mr-2" />
                Play Now
            </Button>
             <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white">
                    <Menu />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background border-l-primary/20">
                  <div className="flex justify-between items-center mb-8">
                     <Link href="/" className="flex items-center gap-2">
                        <Gamepad2 className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold uppercase text-white tracking-widest font-headline">ALICA</span>
                    </Link>
                    <SheetTrigger asChild>
                       <Button variant="ghost" size="icon">
                        <X />
                        <span className="sr-only">Close Menu</span>
                      </Button>
                    </SheetTrigger>
                  </div>
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
                  <Button variant="primary" size="lg" className="mt-8 w-full btn-primary-glow">
                    <Play className="mr-2" />
                    Play Now
                  </Button>
                </SheetContent>
              </Sheet>
        </div>
      </div>
    </header>
  );
}
