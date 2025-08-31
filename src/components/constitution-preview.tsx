"use client";

import { Download, FileText, Share2 } from "lucide-react";
import type { ConstitutionSectionOutput } from "@/ai/flows/generate-constitution-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

type ConstitutionPreviewProps = {
  sections: ConstitutionSectionOutput[];
};

export function ConstitutionPreview({ sections }: ConstitutionPreviewProps) {
  const handleExport = (format: "txt" | "md") => {
    let content = "";
    const title = "Fantom eSport Constitution\n\n";

    if (format === "md") {
      content = `# Fantom eSport Constitution\n\n`;
      content += sections
        .map((section) => `## ${section.sectionTitle}\n\n${section.sectionContent}`)
        .join("\n\n---\n\n");
    } else {
      content = title;
      content += sections
        .map((section) => `${section.sectionTitle}\n\n${section.sectionContent}`)
        .join("\n\n====================\n\n");
    }

    const blob = new Blob([content], { type: `text/${format === "md" ? "markdown" : "plain"}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fantom-esport-constitution.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Constitution Preview
          </CardTitle>
          <CardDescription>
            Your generated constitution will appear here.
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" disabled={sections.length === 0}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Export Constitution</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("txt")}>
              <FileText className="mr-2 h-4 w-4" />
              Export as .txt
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("md")}>
              <Share2 className="mr-2 h-4 w-4" />
              Export as .md
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] w-full rounded-md border p-4">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <GhostIcon className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-semibold">Your constitution is empty.</p>
              <p className="text-sm">Use the generator to add your first section.</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <h1 className="font-headline text-3xl mb-4">Fantom eSport Constitution</h1>
              {sections.map((section, index) => (
                <div key={index} className="mb-6 animate-in fade-in duration-500">
                  <h2 className="font-headline text-2xl font-bold mb-2 pb-2 border-b border-primary/20 text-primary-foreground">
                    {section.sectionTitle}
                  </h2>
                  <p className="whitespace-pre-wrap text-muted-foreground">{section.sectionContent}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
