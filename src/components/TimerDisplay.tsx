
import type React from 'react';

interface TimerDisplayProps {
  seconds: number;
  phase?: "work" | "short-break" | "long-break" | null;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, phase }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  let phaseText = "";
  if (phase === "work") phaseText = "Travail";
  if (phase === "short-break") phaseText = "Pause Courte";
  if (phase === "long-break") phaseText = "Pause Longue";

  return (
    <div className="text-center">
      {phaseText && (
        <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-1 capitalize">
          {phaseText}
        </p>
      )}
      <div className="text-5xl md:text-6xl font-headline font-bold text-foreground tabular-nums select-none">
        {formattedTime}
      </div>
    </div>
  );
};

export default TimerDisplay;
