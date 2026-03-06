import PomodoroController from '@/components/PomodoroController';

export default function PomodoroPage() {
  return (
    <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Takes remaining height from flex col layout without scrolling */}
      <PomodoroController />
    </main>
  );
}
