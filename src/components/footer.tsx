
import Link from "next/link";
import { Button } from "./ui/button";
import { Linkedin, Twitter, MessageCircle, Send } from "lucide-react";


export function Footer() {

  return (
    <footer className="border-t border-primary/20 bg-background/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
           <div className="text-center sm:text-left">
             <p className="text-sm text-foreground font-bold">ALICA</p>
             <p className="text-xs text-muted-foreground">
               &copy;{new Date().getFullYear()} - All rights reserved.
             </p>
           </div>
          <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-white hidden sm:block">FOLLOW ME</span>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <Linkedin className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <Twitter className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <MessageCircle className="h-5 w-5" />
                </Button>
                 <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                    <Send className="h-5 w-5" />
                </Button>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
