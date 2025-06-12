import type React from 'react';

interface CircularProgressProps {
  percentage: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  trackColorClass?: string;
  animationPace?: number; // 0 to 1, influences transition speed
  children?: React.ReactNode;
}

const BASE_CLIENT_TRANSITION_SECONDS = 0.4; // Base transition for the ring moving each second at normal pace

const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 280,
  strokeWidth = 20,
  colorClass = "stroke-primary",
  trackColorClass = "stroke-border",
  animationPace = 1,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Ensure percentage is within 0-100 range
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clampedPercentage / 100) * circumference;

  // Prevent division by zero or overly long/short transitions
  const effectiveAnimationPace = Math.max(0.1, Math.min(2, animationPace)); // Pace between 0.1x and 2x of base
  const transitionDurationValue = (BASE_CLIENT_TRANSITION_SECONDS / effectiveAnimationPace).toFixed(2);
  const transitionDuration = `${transitionDurationValue}s`;
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 absolute">
        <circle
          className={trackColorClass}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${colorClass} transition-all ease-linear`}
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, transitionDuration }}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {children && <div className="z-10 absolute">{children}</div>}
    </div>
  );
};

export default CircularProgress;
