import Link from "next/link";
import { GhostIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <GhostIcon className="w-6 h-6 text-primary" />
            <span className="font-bold font-headline">Fantom eSport</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">
            © {new Date().getFullYear()} Fantom eSport. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
