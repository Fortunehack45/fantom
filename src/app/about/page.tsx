
'use client';

import { Header } from "@/components/header";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";


const timelineEvents = [
    { year: "2018", title: "The Spark", description: "Fantom eSport was born from a small group of friends with a shared passion for competitive gaming and a drive to dominate the leaderboards." },
    { year: "2019", title: "First Tournament Win", description: "Our first major victory in a regional Valorant tournament, putting the Fantom name on the map and proving our potential." },
    { year: "2020", title: "Expanding the Roster", description: "We expanded our ranks, recruiting top-tier talent across multiple games and solidifying our presence in the eSports scene." },
    { year: "2022", title: "Community Growth", description: "Our Discord community surpassed 10,000 members, becoming a vibrant hub for fans, players, and friends." },
    { year: "Present", title: "A New Era", description: "With a new brand identity and this website, we are poised for a new era of growth, competition, and community engagement." },
]

const values = [
    { title: "Excellence", description: "We strive for the highest level of performance in every game we play." },
    { title: "Teamwork", description: "Collaboration and communication are the cornerstones of our success." },
    { title: "Respect", description: "We foster a positive and inclusive environment for all members and our community." },
    { title: "Dedication", description: "Our members are committed to continuous improvement and practice." }
]

const galleryImages = [
    { src: "https://i.pinimg.com/originals/a1/8a/a0/a18aa045f284915ca0e38a2c744f6534.jpg", alt: "Team celebrating a win", hint: "gaming team celebration" },
    { src: "https://i.pinimg.com/originals/e8/5a/33/e85a331a9809a3994337a7a19992569e.jpg", alt: "Gaming setup with neon lights", hint: "neon gaming setup" },
    { src: "https://i.pinimg.com/originals/52/f8/f5/52f8f533479a918452535036127cb099.jpg", alt: "Close-up of a gaming mouse and keyboard", hint: "gaming mouse keyboard" },
    { src: "https://i.pinimg.com/originals/38/54/4e/38544e37d5ab89d19f864117b07d5757.jpg", alt: "eSports arena with a large crowd", hint: "esports arena crowd" },
]

export default function AboutPage() {

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[400px] flex items-center justify-center text-center bg-black">
             <Image
                src="https://i.pinimg.com/originals/e0/75/a6/e075a6fe883584cf543501dc84d5162b.jpg"
                alt="Panoramic view of a futuristic city"
                fill
                className="object-cover w-full h-full opacity-40"
                data-ai-hint="futuristic city panorama"
                priority
            />
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center">
                 <h1 className="text-6xl md:text-7xl font-headline font-black text-white tracking-wider uppercase" style={{ WebkitTextStroke: '1px hsl(var(--primary))', textShadow: '0 0 25px hsl(var(--primary))' }}>
                    About Fantom
                </h1>
                <p className="mt-2 text-xl text-muted-foreground uppercase font-bold tracking-widest max-w-2xl">
                    Forged in competition, united by passion. This is our story.
                </p>
            </div>
        </section>

        <div className="bg-background/80 backdrop-blur-sm">
            {/* Mission Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                    <div className="order-2 md:order-1">
                        <p className="text-primary font-semibold uppercase">Our Mission</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white mt-2">
                           Pushing the Limits of Competitive Gaming
                        </h2>
                        <p className="text-muted-foreground mt-4 text-lg">
                           Fantom eSport was founded on the principle of achieving excellence through dedication and teamwork. We are more than just a clan; we are a community of passionate gamers committed to dominating the competitive landscape. We foster an environment where skill is honed, strategies are perfected, and lifelong friendships are forged.
                        </p>
                    </div>
                     <div className="order-1 md:order-2">
                        <Image
                            src="https://i.pinimg.com/originals/8c/84/7a/8c847a7578964c8d374a3f124bf2c8a3.jpg"
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
                        <p className="text-primary font-semibold uppercase">Our Journey</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            Milestones & Achievements
                        </h2>
                    </div>
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
                </div>
            </section>

             {/* Core Values Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <p className="text-primary font-semibold uppercase">Our Philosophy</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            Our Core Values
                        </h2>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map(value => (
                            <Card key={value.title} className="bg-card/80 text-center">
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
                </div>
            </section>
            
            {/* Gallery Section */}
            <section className="py-16 md:py-24 bg-card/50">
                <div className="container mx-auto px-4">
                     <div className="text-center mb-12">
                        <p className="text-primary font-semibold uppercase">Visuals</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold text-white">
                            Gallery
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {galleryImages.map((image, index) => (
                          <div key={index} className="relative aspect-square group overflow-hidden rounded-lg">
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
                </div>
            </section>
        </div>
      </main>
    </div>
  );
}
