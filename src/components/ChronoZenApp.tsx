
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, TimerIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TimerDisplay from './TimerDisplay';
import CircularProgress from './CircularProgress';
import { useToast } from "@/hooks/use-toast";
import { adjustAnimationPace, type AdjustAnimationPaceInput } from '@/ai/flows/smart-animation-pacing';
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
  const lastAiCallTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAnimationPace = useCallback(async () => {
    if (initialTime <= 0) return;
    if (Date.now() - lastAiCallTimeRef.current < 5000 && timerState === 'running') return;

    lastAiCallTimeRef.current = Date.now();
    try {
      const input: AdjustAnimationPaceInput = {
        selectedTime: initialTime,
        remainingTime: currentTime,
      };
      const result = await adjustAnimationPace(input);
      setAnimationPace(result.animationPace);
    } catch (error) {
      console.error("Erreur lors de la récupération du rythme d'animation:", error);
      setAnimationPace(1);
    }
  }, [initialTime, currentTime, timerState]);

  useEffect(() => {
    if (timerState === "running" && currentTime > 0) {
      fetchAnimationPace();
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
      fetchAnimationPace(); 
    } else { 
      clearInterval(timerIntervalRef.current);
      if (timerState !== 'running' && initialTime > 0) {
        fetchAnimationPace();
      }
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState, currentTime, initialTime, toast, fetchAnimationPace]);


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
    if (timerState === "running") return <Pause className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />;
    // If timer is idle AND (it's at 0 OR it was stopped mid-way and needs reset)
    if (timerState === "idle" && (currentTime === 0 || (currentTime < initialTime && initialTime > 0))) {
      return <RotateCcw className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />;
    }
    // Default to Play (timer is idle and ready, or paused)
    return <Play className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />;
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
      <CardContent className="flex flex-col items-center justify-center space-y-6 md:space-y-8">
        <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">ChronoZen Minuteur</h1>
          <p className="text-muted-foreground">Choisissez un préréglage ou définissez votre propre durée.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {presetTimes.map((preset) => (
            <Button
              key={preset.label}
              variant={initialTime === preset.seconds && timerState === 'idle' && customMinutes === "" ? "default" : "outline"}
              onClick={() => handlePresetSelect(preset.seconds)}
              className="active:scale-95 transition-transform text-sm md:text-base px-3 py-1.5 h-auto md:px-4 md:py-2 bg-accent hover:bg-accent/90 text-accent-foreground border-accent hover:border-accent/90 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
              className="h-10 text-sm w-full"
              aria-label="Durée personnalisée en minutes"
            />
            <Button
              onClick={handleCustomTimeSet}
              disabled={!customMinutes}
              className="h-10 px-4 active:scale-95 transition-transform"
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
          className="w-20 h-20 md:w-24 md:h-24 rounded-full p-0 shadow-lg active:scale-95 transition-transform bg-primary hover:bg-primary/90"
          aria-label={getAriaLabelForControl()}
          disabled={initialTime <= 0 && currentTime < 0 } 
        >
          {getControlIcon()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChronoZenApp;
