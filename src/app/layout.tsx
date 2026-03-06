"use client";

import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('chronozen-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';

    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('chronozen-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <html lang="fr" className={inter.variable}>
      <head>
        <title>ChronoZen</title>
        <meta name="description" content="Minuteur moderne avec temps prédéfinis et fonction Pomodoro." />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-500 overflow-hidden relative w-screen h-dvh flex flex-col">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-secondary/40 rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob animation-delay-4000"></div>
        </div>

        <nav className="bg-background/40 backdrop-blur-xl border-b border-white/10 dark:border-white/5 z-50 flex-none">
          <div className="container mx-auto flex justify-between items-center p-4">
            <div className="flex space-x-6 items-center">
              <Link href="/" className="font-semibold text-lg hover:text-primary transition-colors duration-300">
                ChronoZen
              </Link>
              <Link href="/pomodoro" className="font-medium text-muted-foreground hover:text-foreground transition-colors duration-300">
                Pomodoro
              </Link>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? "Passer au thème sombre" : "Passer au thème clair"}
              className="bg-transparent border-white/20 dark:border-white/10 hover:bg-white/10 dark:hover:bg-white/5"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
