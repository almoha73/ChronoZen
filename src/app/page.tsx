import ChronoZenApp from '@/components/ChronoZenApp';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 selection:bg-accent selection:text-accent-foreground">
      <ChronoZenApp />
    </main>
  );
}
