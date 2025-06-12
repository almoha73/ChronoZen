import type React from 'react';

interface TimerDisplayProps {
  seconds: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds }) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <div className="text-6xl md:text-7xl font-headline font-bold text-foreground tabular-nums select-none">
      {formattedTime}
    </div>
  );
};

export default TimerDisplay;
