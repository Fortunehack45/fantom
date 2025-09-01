import Link from "next/link";
import { Gamepad2, Linkedin, Twitter } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  const navLinks = [
    { href: "/#game", label: "Game" },
    { href: "/#token", label: "Token" },
    { href: "/#contact", label: "Contact" },
    { href: "/#more", label: "More" },
  ];
  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold font-headline uppercase">Alica</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium uppercase">
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
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon">
                <Twitter className="w-5 h-5" />
             </Button>
             <Button variant="ghost" size="icon">
                <Linkedin className="w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
