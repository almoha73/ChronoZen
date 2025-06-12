import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using next/font for optimization
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// If you have specific weights and styles, configure them here
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // Optional: if you want to use it as a CSS variable
});

export const metadata: Metadata = {
  title: 'ChronoZen',
  description: 'Chronomètre moderne avec temps prédéfinis.',
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
