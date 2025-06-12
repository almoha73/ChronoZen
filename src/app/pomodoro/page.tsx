import PomodoroController from '@/components/PomodoroController';

export default function PomodoroPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-background p-4 selection:bg-accent selection:text-accent-foreground">
      {/* 64px is approx height of nav, adjust if needed */}
      <PomodoroController />
    </main>
  );
}
