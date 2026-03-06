import ChronoZenApp from '@/components/ChronoZenApp';

export default function Home() {
  return (
    <main className="flex-1 min-h-0 w-full flex flex-col items-center justify-center p-2 sm:p-4">
      {/* Takes remaining height from flex col layout without scrolling */}
      <ChronoZenApp />
    </main>
  );
}
