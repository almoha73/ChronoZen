
"use client";

import type { Metadata } from 'next';
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

// Note: Metadata cannot be dynamic in root layout for app router easily with "use client"
// For dynamic titles/descriptions based on theme, other strategies would be needed.
// export const metadata: Metadata = {
// title: 'ChronoZen',
// description: 'Minuteur moderne avec temps prédéfinis et fonction Pomodoro.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('chronozen-theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light'; // Default to light if nothing is saved
    
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
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        <nav className="bg-card p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex space-x-6 items-center">
              <Link href="/" className="text-card-foreground hover:text-card-foreground/80 font-medium transition-colors">
                Minuteur Simple
              </Link>
              <Link href="/pomodoro" className="text-card-foreground hover:text-card-foreground/80 font-medium transition-colors">
                Pomodoro
              </Link>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? "Passer au thème sombre" : "Passer au thème clair"}
              className="text-card-foreground hover:text-card-foreground/80"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
