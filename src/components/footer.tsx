import Link from "next/link";
import { Button } from "./ui/button";
import { Linkedin, Twitter, MessageCircle, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-transparent absolute bottom-0 left-0 w-full">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white hidden sm:block">FOLLOW ME</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-white">
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-white">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-white">
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 hover:text-white">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
