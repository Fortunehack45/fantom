'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { GhostIcon } from '@/components/icons';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name === 'Fantom eSport' && password === 'Fantom 1') {
      try {
        sessionStorage.setItem('isAuthenticated', 'true');
        router.push('/admin');
      } catch (error) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Could not save session. Please enable cookies and try again.",
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid name or password.',
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GhostIcon className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Clan Master Login</CardTitle>
          <CardDescription>Enter your credentials to access the management panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Fantom eSport"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" variant="primary">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
