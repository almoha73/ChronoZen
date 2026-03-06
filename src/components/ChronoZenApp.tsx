
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TimerDisplay from './TimerDisplay';
import CircularProgress from './CircularProgress';
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [initialTime, setInitialTime] = useState<number>(presetTimes[1].seconds);
  const [currentTime, setCurrentTime] = useState<number>(presetTimes[1].seconds);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [animationPace, setAnimationPace] = useState<number>(1);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const { toast } = useToast();
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);



  useEffect(() => {
    if (timerState === "running" && currentTime > 0) {
      // Calculate pace mathematically without AI, e.g., speed up slightly at the end
      setAnimationPace(currentTime < initialTime * 0.1 ? 1.5 : 1);
      timerIntervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => Math.max(0, prevTime - 1));
      }, 1000);
    } else if (timerState === "running" && currentTime === 0) {
      clearInterval(timerIntervalRef.current);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(200);
      }
      audioRef.current?.play().catch(e => console.error("Erreur lors de la lecture du son:", e));
      toast({ title: "ChronoZen", description: "C'est terminé !" });
      setTimerState("idle");
      setAnimationPace(1);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState, currentTime, initialTime, toast]);


  const handlePresetSelect = (seconds: number) => {
    setInitialTime(seconds);
    setCurrentTime(seconds);
    setTimerState("idle");
    setCustomMinutes("");
  };

  const handleCustomTimeSet = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      const seconds = minutes * 60;
      setInitialTime(seconds);
      setCurrentTime(seconds);
      setTimerState("idle");
    } else {
      toast({
        title: "Temps Invalide",
        description: "Veuillez entrer un nombre de minutes valide.",
        variant: "destructive",
      });
    }
  };

  const handleControlClick = () => {
    if (timerState === "idle" && (currentTime === 0 || (currentTime < initialTime && initialTime > 0))) {
      // Condition for Reset: Timer is idle and either at 0 or stopped mid-way
      setCurrentTime(initialTime); // Reset time
      setTimerState("idle");       // Ensure state is idle (ready for Play)
    } else if (timerState === "running") {
      // Condition for Pause: Timer is running
      setTimerState("paused");
    } else {
      // Condition for Play: Timer is idle (fresh start or after reset) or paused
      setTimerState("running");
    }
  };

  const getControlIcon = () => {
    if (timerState === "running") return <Pause className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;
    // If timer is idle AND (it's at 0 OR it was stopped mid-way and needs reset)
    if (timerState === "idle" && (currentTime === 0 || (currentTime < initialTime && initialTime > 0))) {
      return <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;
    }
    // Default to Play (timer is idle and ready, or paused)
    return <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;
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
    <Card className="w-full max-w-xl h-full flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl bg-card/60 dark:bg-card/40 border border-white/20 dark:border-white/10 rounded-[2rem] animate-fade-in relative z-10">
      <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-evenly p-2 sm:p-4 md:p-6">
        <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-sm mb-1 sm:mb-2">ChronoZen</h1>
          <p className="text-muted-foreground">Choisissez un préréglage ou définissez votre propre durée.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {presetTimes.map((preset) => (
            <Button
              key={preset.label}
              variant={initialTime === preset.seconds && timerState === 'idle' && customMinutes === "" ? "default" : "outline"}
              onClick={() => handlePresetSelect(preset.seconds)}
              className="active:scale-95 transition-transform text-sm md:text-base px-3 py-1.5 h-auto md:px-4 md:py-2 bg-secondary/50 backdrop-blur-md hover:bg-secondary/80 text-secondary-foreground border border-white/10 dark:border-white/5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm rounded-xl"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="w-full space-y-3 pt-2">
          <Label htmlFor="customTimeInput" className="text-sm font-medium text-muted-foreground">
            Ou définissez une durée personnalisée (minutes) :
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="customTimeInput"
              type="number"
              min="1"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Ex: 45"
              className="h-11 text-sm w-full bg-background/50 border-white/20 dark:border-white/10 backdrop-blur-sm rounded-xl"
              aria-label="Durée personnalisée en minutes"
            />
            <Button
              onClick={handleCustomTimeSet}
              disabled={!customMinutes}
              className="h-11 px-4 active:scale-95 transition-transform rounded-xl bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90"
              aria-label="Définir la durée personnalisée"
            >
              <TimerIcon className="mr-2 h-4 w-4" /> Définir
            </Button>
          </div>
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
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full p-0 shadow-xl active:scale-95 transition-all bg-gradient-to-br from-primary to-accent hover:opacity-90 border border-white/20 flex-shrink-0"
          aria-label={getAriaLabelForControl()}
          disabled={initialTime <= 0 && currentTime < 0}
        >
          {getControlIcon()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChronoZenApp;
