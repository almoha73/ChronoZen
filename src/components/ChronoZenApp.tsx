
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
type PomodoroPhase = "work" | "short-break" | "long-break" | null;

const presetTimes = [
  { label: "3:30", seconds: 210 },
  { label: "5:00", seconds: 300 },
  { label: "10:00", seconds: 600 },
  { label: "15:00", seconds: 900 },
  { label: "20:00", seconds: 1200 },
  { label: "25:00", seconds: 1500 },
  { label: "30:00", seconds: 1800 },
];

const POMODORO_WORK_DURATION = 25 * 60;
const POMODORO_SHORT_BREAK_DURATION = 5 * 60;
const POMODORO_LONG_BREAK_DURATION = 15 * 60;
const POMODORO_CYCLES_BEFORE_LONG_BREAK = 4;

const ChronoZenApp: React.FC = () => {
  const [initialTime, setInitialTime] = useState<number>(presetTimes[1].seconds);
  const [currentTime, setCurrentTime] = useState<number>(presetTimes[1].seconds);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [animationPace, setAnimationPace] = useState<number>(1);
  const { toast } = useToast();
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();
  const lastAiCallTimeRef = useRef<number>(0);

  const [pomodoroMode, setPomodoroMode] = useState<boolean>(false);
  const [pomodoroCycle, setPomodoroCycle] = useState<number>(0); 
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>(null);

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

  const resetPomodoroState = useCallback(() => {
    setPomodoroMode(false);
    setPomodoroCycle(0);
    setPomodoroPhase(null);
  }, []);

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

      if (pomodoroMode && pomodoroPhase) {
        if (pomodoroPhase === "work") {
          if (pomodoroCycle < POMODORO_CYCLES_BEFORE_LONG_BREAK) {
            setPomodoroPhase("short-break");
            setInitialTime(POMODORO_SHORT_BREAK_DURATION);
            setCurrentTime(POMODORO_SHORT_BREAK_DURATION);
            toast({ title: "ChronoZen Pomodoro", description: `Pause courte (${POMODORO_SHORT_BREAK_DURATION / 60} min). Cycle ${pomodoroCycle}/${POMODORO_CYCLES_BEFORE_LONG_BREAK}.` });
            setTimerState("running");
          } else { // After 4th work cycle
            setPomodoroPhase("long-break");
            setInitialTime(POMODORO_LONG_BREAK_DURATION);
            setCurrentTime(POMODORO_LONG_BREAK_DURATION);
            toast({ title: "ChronoZen Pomodoro", description: `Pause longue méritée (${POMODORO_LONG_BREAK_DURATION / 60} min) !` });
            setTimerState("running");
          }
        } else if (pomodoroPhase === "short-break") {
          const nextWorkCycle = pomodoroCycle + 1;
          setPomodoroCycle(nextWorkCycle);
          setPomodoroPhase("work");
          setInitialTime(POMODORO_WORK_DURATION);
          setCurrentTime(POMODORO_WORK_DURATION);
          toast({ title: "ChronoZen Pomodoro", description: `Cycle ${nextWorkCycle}/${POMODORO_CYCLES_BEFORE_LONG_BREAK} : Au travail !` });
          setTimerState("running");
        } else if (pomodoroPhase === "long-break") {
          toast({ title: "ChronoZen Pomodoro", description: "Session Pomodoro (4x25/5 + 15) terminée ! Bravo !" });
          resetPomodoroState();
          const defaultPreset = presetTimes.find(p => p.seconds === POMODORO_WORK_DURATION) || presetTimes[1];
          setInitialTime(defaultPreset.seconds);
          setCurrentTime(defaultPreset.seconds);
          setTimerState("idle");
        }
      } else {
        toast({ title: "ChronoZen", description: "C'est terminé !" });
        setTimerState("idle");
      }
      fetchAnimationPace();
    } else {
      clearInterval(timerIntervalRef.current);
      if (timerState !== 'running' && initialTime > 0) {
        fetchAnimationPace();
      }
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState, currentTime, initialTime, toast, fetchAnimationPace, pomodoroMode, pomodoroPhase, pomodoroCycle, resetPomodoroState]);


  const handlePresetSelect = (seconds: number) => {
    resetPomodoroState();
    setInitialTime(seconds);
    setCurrentTime(seconds);
    setTimerState("idle");
  };

  const handleStartPomodoro = () => {
    setPomodoroMode(true);
    setPomodoroCycle(1);
    setPomodoroPhase("work");
    setInitialTime(POMODORO_WORK_DURATION);
    setCurrentTime(POMODORO_WORK_DURATION);
    setTimerState("running");
    toast({ title: "ChronoZen Pomodoro", description: `Cycle 1/${POMODORO_CYCLES_BEFORE_LONG_BREAK} : Au travail !` });
  };

  const handleControlClick = () => {
    if (timerState === "idle") {
      if (currentTime === 0 || (currentTime < initialTime && initialTime > 0)) {
        setCurrentTime(initialTime);
      }
      if (!pomodoroMode || (pomodoroMode && pomodoroCycle === 0)) {
         setTimerState("running");
      } else if (pomodoroMode && currentTime > 0) {
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
      <CardContent className="flex flex-col items-center justify-center space-y-6 md:space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">ChronoZen</h1>
          <p className="text-muted-foreground">Concentrez-vous. Respirez. Réussissez.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {presetTimes.map((preset) => (
            <Button
              key={preset.label}
              variant={initialTime === preset.seconds && timerState === 'idle' && !pomodoroMode ? "default" : "outline"}
              onClick={() => handlePresetSelect(preset.seconds)}
              className="active:scale-95 transition-transform text-sm md:text-base px-3 py-1.5 h-auto md:px-4 md:py-2 bg-accent hover:bg-accent/90 text-accent-foreground border-accent hover:border-accent/90 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <Button
          variant="default"
          onClick={handleStartPomodoro}
          className="w-full active:scale-95 transition-transform"
          disabled={timerState === 'running' && pomodoroMode && pomodoroPhase !== null && pomodoroCycle > 0}
        >
          Démarrer Session Pomodoro
        </Button>
        
        <CircularProgress 
          percentage={progressPercentage} 
          animationPace={animationPace}
          colorClass="stroke-primary"
          trackColorClass="stroke-border/50"
          size={260}
          strokeWidth={18}
        >
          <TimerDisplay seconds={currentTime} phase={pomodoroMode ? pomodoroPhase : null} />
        </CircularProgress>

        <Button
          onClick={handleControlClick}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full p-0 shadow-lg active:scale-95 transition-transform bg-primary hover:bg-primary/90"
          aria-label={getAriaLabelForControl()}
          disabled={pomodoroMode && timerState === 'idle' && currentTime === 0 && pomodoroPhase !== null}
        >
          {getControlIcon()}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChronoZenApp;
