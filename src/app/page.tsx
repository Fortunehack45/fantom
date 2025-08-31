import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GhostIcon } from "@/components/icons";
import { Dices, Swords, Users } from "lucide-react";

export default function Home() {
  const roster = [
    { name: "ErnestoDKS412", role: "Legendary", server: "01Ernesto-5332", moderator: "Moderator", date: "06/06/2022 @ 11:25 AM CET", rankColor: "bg-purple-500" },
    { name: "ErnestoDKS412", role: "Legendary", server: "01Ernesto-5332", moderator: "Moderator", date: "06/06/2022 @ 11:25 AM CET", rankColor: "bg-purple-500" },
    { name: "ErnestoDKS412", role: "Pro", server: "01Ernesto-5332", moderator: "Moderator", date: "06/06/2022 @ 11:25 AM CET", rankColor: "bg-green-500" },
    { name: "ErnestoDKS412", role: "Legendary", server: "01Ernesto-5332", moderator: "Moderator", date: "06/06/2022 @ 11:25 AM CET", rankColor: "bg-purple-500" },
    { name: "ErnestoDKS412", role: "New Member", server: "01Ernesto-5332", moderator: "Moderator", date: "06/06/2022 @ 11:25 AM CET", rankColor: "bg-blue-500" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/1920/1080"
            alt="Fantom eSport Background"
            fill
            className="object-cover"
            data-ai-hint="dark fantasy landscape"
          />
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 p-4 flex flex-col items-center animate-in fade-in duration-1000">
            <h1 className="text-6xl md:text-8xl font-headline font-black mb-2 tracking-wider">
              FANTOM ESPORT
            </h1>
            <p className="text-xl md:text-2xl font-headline text-primary">
              UNCONQUERED POWER
            </p>
          </div>
        </section>

        {/* Server Status Section */}
        <section id="servers" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="bg-card border-l-4 border-green-500">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold">Main Server - [LIVE]</h3>
                                <Users className="text-green-500"/>
                            </div>
                            <p className="text-muted-foreground mb-4">Our main server is online and ready for action. Join us for competitive play and community events.</p>
                            <div className="flex items-center gap-4">
                                <Button variant="accent" size="sm">Discord</Button>
                                <p className="text-xs text-muted-foreground">main-server.fantom.gg</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-l-4 border-green-500">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold">Practice Server - [LIVE]</h3>
                                <Users className="text-green-500"/>
                            </div>
                            <p className="text-muted-foreground mb-4">Hone your skills on our practice server. A perfect place for training and trying out new strategies.</p>
                             <div className="flex items-center gap-4">
                                <Button variant="accent" size="sm">Discord</Button>
                                <p className="text-xs text-muted-foreground">practice-server.fantom.gg</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>


        {/* Blog Section */}
        <section id="blog" className="py-16 md:py-24 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-bold uppercase">Read Our Most Recent Blog Posts</p>
              <h2 className="text-3xl md:text-4xl font-headline font-bold">
                BLOG - RECENT ARTICLES
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Image
                      src={`https://picsum.photos/400/${250 + i}`}
                      alt="Blog Post Image"
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                      data-ai-hint="fantasy character art"
                    />
                     <Badge className="absolute top-2 left-2" variant="primary">TUTORIAL</Badge>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-headline mb-2">The Ultimate Guide to Winning</CardTitle>
                    <p className="text-muted-foreground text-sm">
                      Discover the strategies and tips from our pro players to dominate the competition and climb the ranks...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
             <div className="text-center mt-12">
                <Button variant="outline">View All Posts</Button>
            </div>
          </div>
        </section>

        {/* Clan Roster Section */}
        <section id="roster" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <p className="text-primary font-bold uppercase">WE ARE THE BEST OF THE BEST, JOIN US!</p>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">
                        OUR CLAN - FANTOM ESPORT
                    </h2>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    <Card className="lg:col-span-1 bg-card border-l-4 border-primary">
                        <CardHeader>
                            <CardTitle>Join Our Ranks!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-6">We are always looking for talented and dedicated players to join our family. Apply now and become part of our legacy.</p>
                            <Button variant="primary">Recruitment</Button>
                        </CardContent>
                    </Card>
                    <div className="lg:col-span-2">
                        <Card className="bg-card">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle className="flex items-center gap-2"><Swords/> Clan Roster</CardTitle>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm">Server 1</Button>
                                    <Button variant="ghost" size="sm">Server 2</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>#</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Server</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {roster.map((member, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{index + 1}.</TableCell>
                                                <TableCell>{member.name}</TableCell>
                                                <TableCell><Badge className={`${member.rankColor} text-white`}>{member.role}</Badge></TableCell>
                                                <TableCell>{member.server}</TableCell>
                                                <TableCell>{member.moderator}</TableCell>
                                                <TableCell>{member.date}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Discord Section */}
        <section id="discord" className="py-16 md:py-24 bg-card">
            <div className="container mx-auto px-4 text-center">
                 <p className="text-primary font-bold uppercase">JOIN OUR DISCORD SERVER!</p>
                 <h2 className="text-3xl md:text-4xl font-headline font-bold mb-12">
                    DISCORD SERVER
                </h2>
                <div className="grid lg:grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2"><Dices /> Discord Announcements</h3>
                        {[...Array(3)].map((_,i) => (
                            <div key={i} className="bg-background/50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Image src="https://picsum.photos/40/40" width={40} height={40} alt="User Avatar" className="rounded-full" data-ai-hint="person avatar"/>
                                    <div>
                                        <span className="font-bold">@DukeGR4813</span>
                                        <span className="text-xs text-muted-foreground ml-2">06/06/2022 @ 11:25 AM CET</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">New event announced! Check the events channel for more details and sign up now.</p>
                            </div>
                        ))}
                    </div>
                     <div className="flex flex-col items-center justify-center bg-background/50 rounded-lg p-8">
                        <Image src="https://picsum.photos/300/400" width={300} height={400} alt="Discord Promo" className="mb-6 rounded-lg" data-ai-hint="fantasy warrior character" />
                        <Button variant="primary" size="lg">Join Discord</Button>
                    </div>
                </div>
            </div>
        </section>


        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
             <p className="text-primary font-bold uppercase">WE ARE THE BEST L2 PLAYERS</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
              ABOUT OUR CLAN
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              We are a competitive and friendly community of gamers who strive for excellence in every match. Our clan is built on teamwork, dedication, and a passion for winning. Join us to be a part of our journey.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
