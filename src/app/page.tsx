"use client";

import { useState } from "react";
import type { ConstitutionSectionOutput } from "@/ai/flows/generate-constitution-section";
import { ConstitutionGenerator } from "@/components/constitution-generator";
import { ConstitutionPreview } from "@/components/constitution-preview";
import { GhostIcon } from "@/components/icons";

export default function Home() {
  const [sections, setSections] = useState<ConstitutionSectionOutput[]>([]);

  const addSection = (newSection: ConstitutionSectionOutput) => {
    setSections((prevSections) => [...prevSections, newSection]);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-center gap-4 p-6 border-b">
        <GhostIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-headline font-bold text-center">
          Fantom eSport Constitution Builder
        </h1>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 md:p-8">
        <ConstitutionGenerator
          onSectionGenerated={addSection}
          generatedSections={sections.map((s) => s.sectionTitle)}
        />
        <ConstitutionPreview sections={sections} />
      </div>
    </main>
  );
}
