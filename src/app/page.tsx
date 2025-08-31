import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Users, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Fantom eSport Team"
            fill
            className="object-cover"
            data-ai-hint="gaming action"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 p-4 animate-in fade-in duration-1000">
            <h1 className="text-4xl md:text-7xl font-headline font-bold mb-4">
              Fantom eSport
            </h1>
            <p className="text-lg md:text-2xl mb-8">
              Dominating the competition.
            </p>
            <Button size="lg">Join Our Discord</Button>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              About Fantom eSport
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="md:w-1/2">
                <Image
                  src="https://picsum.photos/600/400"
                  alt="Team members celebrating"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  data-ai-hint="team celebration"
                />
              </div>
              <div className="md:w-1/2">
                <p className="text-muted-foreground text-lg mb-4">
                  Fantom eSport was forged in the fires of competitive gaming. We are a dedicated group of players who strive for excellence, teamwork, and victory. Our journey is fueled by passion and a relentless drive to be the best.
                </p>
                <p className="text-muted-foreground text-lg">
                  We believe in nurturing talent, fostering a positive community, and competing at the highest levels. Join us and become a part of our legacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="games" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12">
              Our Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Image
                    src="https://picsum.photos/400/250"
                    alt="CODM"
                    width={400}
                    height={250}
                    className="rounded-t-lg object-cover"
                    data-ai-hint="mobile shooter"
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-headline mb-2">Call of Duty: Mobile</CardTitle>
                  <p className="text-muted-foreground">
                    Fast-paced mobile FPS action where we dominate the leaderboards.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Image
                    src="https://picsum.photos/400/251"
                    alt="Blood Strike"
                    width={400}
                    height={251}
                    className="rounded-t-lg object-cover"
                    data-ai-hint="tactical shooter"
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-headline mb-2">Blood Strike</CardTitle>
                  <p className="text-muted-foreground">
                    Strategic gameplay and clutch moments are our specialty in this tactical shooter.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Image
                    src="https://picsum.photos/400/252"
                    alt="Future Game"
                    width={400}
                    height={252}
                    className="rounded-t-lg object-cover"
                    data-ai-hint="esports arena"
                  />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-2xl font-headline mb-2">More to Come</CardTitle>
                  <p className="text-muted-foreground">
                    We are always looking to expand into new competitive titles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="join" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              Join Our Ranks
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Ready to take your gaming to the next level? Join the Fantom eSport community and compete with the best.
            </p>
            <Button size="lg" variant="default">
              Apply to Join
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
