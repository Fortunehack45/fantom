
'use client';

import { Header } from "@/components/header";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Footer } from "@/components/footer";

interface TimelineEvent {
    id: string;
    year: string;
    title: string;
    description: string;
}

interface CoreValue {
    id: string;
    title: string;
    description: string;
}

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
    hint: string;
}

interface AboutPageContent {
    heroImageUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    missionImageUrl?: string;
    missionTitle?: string;
    missionDescription?: string;
    missionTagline?: string;
    timelineTitle?: string;
    timelineTagline?: string;
    valuesTitle?: string;
    valuesTagline?: string;
    galleryTitle?: string;
    galleryTagline?: string;
}

const defaultContent: AboutPageContent = {
    heroImageUrl: "https://i.pinimg.com/originals/e0/75/a6/e075a6fe883584cf543501dc84d5162b.jpg",
    heroTitle: "About Fantom",
    heroSubtitle: "Forged in competition, united by passion. This is our story.",
    missionImageUrl: "https://i.pinimg.com/originals/8c/84/7a/8c847a7578964c8d374a3f124bf2c8a3.jpg",
    missionTitle: "Pushing the Limits of Competitive Gaming",
    missionDescription: "Fantom eSport was founded on the principle of achieving excellence through dedication and teamwork. We are more than just a clan; we are a community of passionate gamers committed to dominating the competitive landscape. We foster an environment where skill is honed, strategies are perfected, and lifelong friendships are forged.",
    missionTagline: "Our Mission",
    timelineTitle: "Milestones & Achievements",
    timelineTagline: "Our Journey",
    valuesTitle: "Our Core Values",
    valuesTagline: "Our Philosophy",
    galleryTitle: "Gallery",
    galleryTagline: "Visuals",
};

export default function AboutPage() {
    const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
    const [values, setValues] = useState<CoreValue[]>([]);
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [pageContent, setPageContent] = useState<AboutPageContent>(defaultContent);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const timelineQuery = query(collection(db, "timelineEvents"), orderBy("year", "asc"));
                const valuesQuery = query(collection(db, "coreValues"));
                const galleryQuery = query(collection(db, "galleryImages"));
                const contentDocRef = doc(db, "pageContent", "about");

                const [timelineSnapshot, valuesSnapshot, gallerySnapshot, contentDocSnap] = await Promise.all([
                    getDocs(timelineQuery),
                    getDocs(valuesQuery),
                    getDocs(galleryQuery),
                    getDoc(contentDocRef),
                ]);

                const timelineData: TimelineEvent[] = timelineSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent));
                const valuesData: CoreValue[] = valuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoreValue));
                const galleryData: GalleryImage[] = gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryImage));
                
                if (contentDocSnap.exists()) {
                    // Merge fetched data with defaults to avoid missing fields
                    setPageContent({ ...defaultContent, ...contentDocSnap.data() });
                }
                
                setTimelineEvents(timelineData);
                setValues(valuesData);
                setGalleryImages(galleryData);

            } catch (error) {
                console.error("Failed to fetch about page data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[400px] flex items-center justify-center text-center bg-black">
             <Image
                src={pageContent.heroImageUrl!}
                alt="Panoramic view of a futuristic city"
                fill
                className="object-cover w-full h-full opacity-40"
                data-ai-hint="futuristic city panorama"
                priority
            />
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
                 <h1 className="text-6xl md:text-7xl font-headline font-black text-white tracking-wider uppercase" style={{ WebkitTextStroke: '1px hsl(var(--primary))', textShadow: '0 0 25px hsl(var(--primary))' }}>
                    {pageContent.heroTitle}
                </h1>
                <p className="mt-2 text-xl text-muted-foreground uppercase font-bold tracking-widest max-w-2xl">
                    {pageContent.heroSubtitle}
                </p>
            </div>
        </section>

        <div className="bg-background/80 backdrop-blur-sm">
            {/* Mission Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <p className="text-primary font-semibold uppercase">{pageContent.missionTagline}</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white mt-2">
                           {pageContent.missionTitle}
                        </h2>
                        <p className="text-muted-foreground mt-4 text-lg">
                           {pageContent.missionDescription}
                        </p>
                    </div>
                     <div className="order-1 md:order-2">
                        <Image
                            src={pageContent.missionImageUrl!}
                            alt="eSports player focused on the game"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-2xl shadow-primary/20 transform hover:scale-105 transition-transform duration-500"
                            data-ai-hint="esports player focused"
                        />
                    </div>
                </div>
            </section>
            
            {/* Timeline Section */}
            <section className="py-16 md:py-24 bg-card/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold uppercase">{pageContent.timelineTagline}</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            {pageContent.timelineTitle}
                        </h2>
                    </div>
                     {loading ? (
                        <div className="text-center"><p>Loading timeline...</p></div>
                    ) : (
                    <div className="relative">
                        <div className="absolute left-1/2 h-full w-0.5 bg-primary/20 -translate-x-1/2"></div>
                        {timelineEvents.map((event, index) => (
                           <div key={index} className={`flex items-center w-full mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                                    <Card className="transform hover:-translate-y-1 transition-transform duration-300">
                                         <CardHeader>
                                            <div className={`flex items-center ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                               <p className={`text-lg font-headline font-bold text-primary ${index % 2 === 0 ? 'order-2 ml-4' : 'order-1 mr-4'}`}>{event.year}</p>
                                               <h3 className={`text-xl font-bold ${index % 2 === 0 ? 'order-1 text-right' : 'text-left'}`}>{event.title}</h3>
                                            </div>
                                         </CardHeader>
                                         <CardContent className={`${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                            <p className="text-muted-foreground">{event.description}</p>
                                         </CardContent>
                                    </Card>
                                </div>
                           </div>
                        ))}
                    </div>
                    )}
                </div>
            </section>

             {/* Core Values Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold uppercase">{pageContent.valuesTagline}</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            {pageContent.valuesTitle}
                        </h2>
                    </div>
                     {loading ? (
                        <div className="text-center"><p>Loading values...</p></div>
                     ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map(value => (
                            <Card key={value.id} className="bg-card/80 text-center">
                                <CardContent className="p-6">
                                    <div className="mx-auto bg-primary/10 rounded-full h-16 w-16 flex items-center justify-center">
                                        <CheckCircle className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold mt-6">{value.title}</h3>
                                    <p className="text-muted-foreground mt-2">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                     )}
                </div>
            </section>
            
            {/* Gallery Section */}
            <section className="py-16 md:py-24 bg-card/50">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <p className="text-primary font-semibold uppercase">{pageContent.galleryTagline}</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            {pageContent.galleryTitle}
                        </h2>
                    </div>
                     {loading ? (
                        <div className="text-center"><p>Loading gallery...</p></div>
                     ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((image) => (
                          <div key={image.id} className="relative aspect-square group overflow-hidden rounded-lg">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-500"
                                    data-ai-hint={image.hint}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          </div>
                        ))}
                    </div>
                     )}
                </div>
            </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
