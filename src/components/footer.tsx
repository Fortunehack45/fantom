import Link from "next/link";
import { DoomIcon } from "./icons";

export function Footer() {

  return (
    <footer className="border-t border-white/10 bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
           <p className="text-xs text-muted-foreground">
             &copy;{new Date().getFullYear()} Doom.com - Fantasy Game Webdesign All rights reserved.
           </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Design & Animation by</span>
            <span className="font-bold text-foreground">PUNITS STORE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
