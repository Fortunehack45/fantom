import Link from "next/link";
import { GhostIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <GhostIcon className="w-6 h-6 text-primary" />
            <span className="font-bold font-headline uppercase">Fantom</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fantom eSport. All Rights Reserved.
          </p>
          <p className="text-xs text-muted-foreground/50 mt-2 md:mt-0">
            Design & Animation by PUNKT.S SIORF
          </p>
        </div>
      </div>
    </footer>
  );
}
