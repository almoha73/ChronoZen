import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using next/font for optimization
import Link from 'next/link';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// If you have specific weights and styles, configure them here
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: if you want to use it as a CSS variable
});

export const metadata: Metadata = {
  title: 'ChronoZen',
  description: 'Minuteur moderne avec temps prédéfinis et fonction Pomodoro.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Google Fonts link is managed by next/font, no manual <link> needed for Inter */}
      </head>
      <body className="font-body antialiased">
        <nav className="bg-card p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-center items-center space-x-6">
            <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Minuteur Simple
            </Link>
            <Link href="/pomodoro" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Pomodoro
            </Link>
          </div>
        </nav>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
