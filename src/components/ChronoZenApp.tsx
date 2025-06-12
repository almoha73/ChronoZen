"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TimerDisplay from './TimerDisplay';
import CircularProgress from './CircularProgress';
import { useToast } from "@/hooks/use-toast";
import { adjustAnimationPace, type AdjustAnimationPaceInput } from '@/ai/flows/smart-animation-pacing';

type TimerState = "idle" | "running" | "paused";

const presetTimes = [
  { label: "3:30", seconds: 210 },
  { label: "5:00", seconds: 300 },
  { label: "10:00", seconds: 600 },
  { label: "15:00", seconds: 900 },
  { label: "20:00", seconds: 1200 },
  { label: "25:00", seconds: 1500 },
  { label: "30:00", seconds: 1800 },
];

const ChronoZenApp: React.FC = () => {
  const [initialTime, setInitialTime] = useState<number>(presetTimes[1].seconds); // Default to 5:00
  const [currentTime, setCurrentTime] = useState<number>(presetTimes[1].seconds);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [animationPace, setAnimationPace] = useState<number>(1);
  // const [aiReasoning, setAiReasoning] = useState<string | null>(null); // For debugging AI
  const { toast } = useToast();
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();
  const lastAiCallTimeRef = useRef<number>(0);

  const fetchAnimationPace = useCallback(async () => {
    if (initialTime <= 0) return;
    // Debounce AI calls to prevent excessive calls, e.g., once every 2 seconds
    if (Date.now() - lastAiCallTimeRef.current < 2000 && timerState === 'running') return;

    lastAiCallTimeRef.current = Date.now();
    try {
      const input: AdjustAnimationPaceInput = {
        selectedTime: initialTime,
        remainingTime: currentTime,
      };
      const result = await adjustAnimationPace(input);
      setAnimationPace(result.animationPace);
      // setAiReasoning(result.reasoning); // console.log("AI Pacing:", result.animationPace, result.reasoning);
    } catch (error) {
      console.error("Error fetching animation pace:", error);
      setAnimationPace(1); // Default to normal pace on error
      // setAiReasoning("Error fetching pacing info.");
    }
  }, [initialTime, currentTime, timerState]);


  useEffect(() => {
    if (timerState === "running" && currentTime > 0) {
      fetchAnimationPace(); // Update pace when timer is running
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => Math.max(0, prevTime - 1));
      }, 1000);
    } else if (timerState === "running" && currentTime === 0) {
      setTimerState("idle");
      clearInterval(timerIntervalRef.current);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }
      toast({ title: "ChronoZen", description: "C'est terminé !" });
      fetchAnimationPace(); // Update pace for idle state
    } else {
      clearInterval(timerIntervalRef.current);
       if (timerState !== 'running' && initialTime > 0) { // Fetch pace when idle or paused
        fetchAnimationPace();
      }
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState, currentTime, initialTime, toast, fetchAnimationPace]);


  const handlePresetSelect = (seconds: number) => {
    setInitialTime(seconds);
    setCurrentTime(seconds);
    setTimerState("idle");
    // fetchAnimationPace will be called by useEffect due to state change
  };

  const handleControlClick = () => {
    if (timerState === "idle") {
      if (currentTime === 0 || (currentTime < initialTime && initialTime > 0)) { // Finished or stopped early
        setCurrentTime(initialTime);
        // fetchAnimationPace will be called by useEffect
      } else { // currentTime === initialTime, ready to start
        setTimerState("running");
      }
    } else if (timerState === "running") {
      setTimerState("paused");
    } else if (timerState === "paused") {
      setTimerState("running");
    }
  };

  const getControlIcon = () => {
    if (timerState === "running") return <Pause className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />;
    if (timerState === "idle" && (currentTime === 0 || (currentTime < initialTime && initialTime > 0))) {
      return <RotateCcw className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />;
    }
    return <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />;
  };
  
  const progressPercentage = initialTime > 0 ? ((initialTime - currentTime) / initialTime) * 100 : 0;

  const getAriaLabelForControl = () => {
    if (timerState === 'running') return 'Mettre en pause';
    if (timerState === 'idle' && (currentTime === 0 || (currentTime < initialTime && initialTime > 0))) {
      return 'Réinitialiser';
    }
    return 'Démarrer';
  };

  return (
    <Card className="w-full max-w-md p-4 md:p-8 shadow-2xl rounded-xl bg-card animate-fade-in">
      <CardContent className="flex flex-col items-center justify-center space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">ChronoZen</h1>
          <p className="text-muted-foreground">Concentrez-vous. Respirez. Réussissez.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {presetTimes.map((preset) => (
            <Button
              key={preset.label}
              variant={initialTime === preset.seconds && timerState === 'idle' ? "default" : "outline"}
              onClick={() => handlePresetSelect(preset.seconds)}
              className="active:scale-95 transition-transform text-sm md:text-base px-3 py-1.5 h-auto md:px-4 md:py-2 bg-accent hover:bg-accent/90 text-accent-foreground border-accent hover:border-accent/90 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        
        <CircularProgress 
          percentage={progressPercentage} 
          animationPace={animationPace}
          colorClass="stroke-primary"
          trackColorClass="stroke-border/50"
          size={260}
          strokeWidth={18}
        >
          <TimerDisplay seconds={currentTime} />
        </CircularProgress>

        <Button
          onClick={handleControlClick}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full p-0 shadow-lg active:scale-95 transition-transform bg-primary hover:bg-primary/90"
          aria-label={getAriaLabelForControl()}
        >
          {getControlIcon()}
        </Button>
        {/* <p className="text-xs text-muted-foreground text-center h-8 overflow-y-auto">AI Reasoning: {aiReasoning || "N/A"}</p> */}

      </CardContent>
    </Card>
  );
};

export default ChronoZenApp;
