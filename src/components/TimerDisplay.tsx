
import type React from 'react';

interface TimerDisplayProps {
  seconds: number;
  phase?: "work" | "break" | null;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, phase }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <div className="text-center">
      {phase && (
        <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-1 capitalize">
          {phase === "work" ? "Travail" : "Pause"}
          {/* Consider adding cycle number here if desired, e.g. - Cycle X/Y */}
        </p>
      )}
      <div className="text-5xl md:text-6xl font-headline font-bold text-foreground tabular-nums select-none">
        {formattedTime}
      </div>
    </div>
  );
};

export default TimerDisplay;
