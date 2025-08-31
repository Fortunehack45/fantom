"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, BookCopy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { handleGenerateSection } from "@/app/actions";
import type { ConstitutionSectionOutput } from "@/ai/flows/generate-constitution-section";

const formSchema = z.object({
  clanName: z.string().min(1, "Clan name is required."),
  game: z.string().min(1, "Game is required."),
  sectionType: z.string().min(1, "Please select a section type."),
  additionalDetails: z.string().optional(),
});

type ConstitutionGeneratorProps = {
  onSectionGenerated: (section: ConstitutionSectionOutput) => void;
  generatedSections: string[];
};

const sectionTypes = [
  "Identity & Vision",
  "Clan Structure",
  "Recruitment Process",
  "Game Divisions",
  "Training & Practice",
  "Competitions & Events",
  "Community & Branding",
  "Rules & Code of Conduct",
  "Growth Roadmap",
];

export function ConstitutionGenerator({ onSectionGenerated, generatedSections }: ConstitutionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clanName: "Fantom eSport",
      game: "CODM, Blood Strike",
      sectionType: "",
      additionalDetails: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true);
    try {
      const result = await handleGenerateSection(values);
      onSectionGenerated(result);
      toast({
        title: "Section Generated",
        description: `"${result.sectionTitle}" has been added to your constitution.`,
      });
      form.reset({
        ...values,
        sectionType: "",
        additionalDetails: "",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the constitution section. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <BookCopy className="w-6 h-6 text-primary" />
          Section Generator
        </CardTitle>
        <CardDescription>
          Select a section type and add details to generate a part of your clan constitution.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clanName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clan Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="game"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Game(s)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sectionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Section Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a section to generate..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Specify rules for new recruits, add details about the leadership hierarchy, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {generatedSections.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Generated Sections:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {generatedSections.map((title) => (
                    <li key={title} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      {title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Section"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
