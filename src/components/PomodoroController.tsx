
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TimerDisplay from './TimerDisplay';
import CircularProgress from './CircularProgress';
import { useToast } from "@/hooks/use-toast";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TimerState = "idle" | "running" | "paused";
type PomodoroPhase = "work" | "short-break" | "long-break" | null;

const DEFAULT_POMODORO_WORK_DURATION = 25 * 60;
const DEFAULT_POMODORO_SHORT_BREAK_DURATION = 5 * 60;
const DEFAULT_POMODORO_LONG_BREAK_DURATION = 15 * 60;
const POMODORO_CYCLES_BEFORE_LONG_BREAK = 4;

const PomodoroController: React.FC = () => {
  const [initialTime, setInitialTime] = useState<number>(DEFAULT_POMODORO_WORK_DURATION);
  const [currentTime, setCurrentTime] = useState<number>(DEFAULT_POMODORO_WORK_DURATION);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [animationPace, setAnimationPace] = useState<number>(1);
  const { toast } = useToast();
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [pomodoroCycle, setPomodoroCycle] = useState<number>(0);
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>(null);

  const [workMinutes, setWorkMinutes] = useState<string>("25");
  const [shortBreakMinutes, setShortBreakMinutes] = useState<string>("5");
  const [longBreakMinutes, setLongBreakMinutes] = useState<string>("15");

  const getPomodoroWorkDuration = useCallback(() => (parseInt(workMinutes, 10) * 60) || DEFAULT_POMODORO_WORK_DURATION, [workMinutes]);
  const getPomodoroShortBreakDuration = useCallback(() => (parseInt(shortBreakMinutes, 10) * 60) || DEFAULT_POMODORO_SHORT_BREAK_DURATION, [shortBreakMinutes]);
  const getPomodoroLongBreakDuration = useCallback(() => (parseInt(longBreakMinutes, 10) * 60) || DEFAULT_POMODORO_LONG_BREAK_DURATION, [longBreakMinutes]);



  const resetPomodoroState = useCallback(() => {
    setPomodoroCycle(0);
    setPomodoroPhase(null);
    const currentWorkDuration = getPomodoroWorkDuration();
    setInitialTime(currentWorkDuration);
    setCurrentTime(currentWorkDuration);
    setTimerState("idle");
  }, [getPomodoroWorkDuration]);

  useEffect(() => {
    if (timerState === "running" && currentTime > 0) {
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

      if (pomodoroPhase) {
        const currentShortBreakDuration = getPomodoroShortBreakDuration();
        const currentLongBreakDuration = getPomodoroLongBreakDuration();
        const currentWorkDuration = getPomodoroWorkDuration();

        if (pomodoroPhase === "work") {
          if (pomodoroCycle < POMODORO_CYCLES_BEFORE_LONG_BREAK) {
            setPomodoroPhase("short-break");
            setInitialTime(currentShortBreakDuration);
            setCurrentTime(currentShortBreakDuration);
            toast({ title: "ChronoZen Pomodoro", description: `Pause courte (${currentShortBreakDuration / 60} min). Cycle ${pomodoroCycle}/${POMODORO_CYCLES_BEFORE_LONG_BREAK}.` });
            setTimerState("running");
          } else {
            setPomodoroPhase("long-break");
            setInitialTime(currentLongBreakDuration);
            setCurrentTime(currentLongBreakDuration);
            toast({ title: "ChronoZen Pomodoro", description: `Pause longue méritée (${currentLongBreakDuration / 60} min) !` });
            setTimerState("running");
          }
        } else if (pomodoroPhase === "short-break") {
          const nextWorkCycle = pomodoroCycle + 1;
          setPomodoroCycle(nextWorkCycle);
          setPomodoroPhase("work");
          setInitialTime(currentWorkDuration);
          setCurrentTime(currentWorkDuration);
          toast({ title: "ChronoZen Pomodoro", description: `Cycle ${nextWorkCycle}/${POMODORO_CYCLES_BEFORE_LONG_BREAK} : Au travail !` });
          setTimerState("running");
        } else if (pomodoroPhase === "long-break") {
          toast({ title: "ChronoZen Pomodoro", description: `Session Pomodoro terminée ! Bravo !` });
          resetPomodoroState();
        }
      } else {
        // This case should ideally not be reached if pomodoroPhase is managed correctly
        toast({ title: "ChronoZen", description: "C'est terminé !" });
        setTimerState("idle");
      }
      setAnimationPace(1);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [timerState, currentTime, initialTime, toast, pomodoroPhase, pomodoroCycle, resetPomodoroState, getPomodoroWorkDuration, getPomodoroShortBreakDuration, getPomodoroLongBreakDuration]);

  const handleStartPomodoro = () => {
    const currentWorkDuration = getPomodoroWorkDuration();
    setPomodoroCycle(1);
    setPomodoroPhase("work");
    setInitialTime(currentWorkDuration);
    setCurrentTime(currentWorkDuration);
    setTimerState("running");
    toast({ title: "ChronoZen Pomodoro", description: `Cycle 1/${POMODORO_CYCLES_BEFORE_LONG_BREAK} : Au travail ! (${currentWorkDuration / 60} min)` });
  };

  const handleControlClick = () => {
    if (!pomodoroPhase && timerState === "idle") {
      // This condition might need review based on whether there's a non-Pomodoro timer on this page
      // For now, assuming this control is only for active Pomodoro or starting one.
      // If currentTime needs reset outside Pomodoro, logic would differ.
      if (currentTime === 0 || currentTime < initialTime) {
        // This reset to initialTime might not be desired if it's not a Pomodoro context
        // setCurrentTime(initialTime); // Consider if this is always right
      }
      // setTimerState("running"); // This might be too aggressive if Pomodoro hasn't started
      return; // Or handle reset/start appropriately if not a Pomodoro session
    }

    // Logic for an active Pomodoro session
    if (timerState === "idle" && pomodoroPhase) { // Typically means a phase just ended, or it's paused and reset
      if (currentTime === 0) { // If timer hit zero (e.g., after a break finished naturally but wasn't auto-continued to work)
        // Logic to advance to next phase or reset based on pomodoroPhase
        // This is complex as useEffect already handles transitions.
        // A reset to initialTime of *current* phase might be intended here before play.
        setCurrentTime(initialTime);
      }
      setTimerState("running");

    } else if (timerState === "running") {
      setTimerState("paused");
    } else if (timerState === "paused") {
      setTimerState("running");
    }
  };


  const getControlIcon = () => {
    if (timerState === "running") return <Pause className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;

    // If a Pomodoro session is active (or has been) and is now idle/paused
    if (pomodoroPhase) {
      // If the current phase just ended (currentTime is 0) and we are idle (e.g. long break finished)
      // OR if timer was paused then reset (currentTime < initialTime)
      if (timerState === "idle" && (currentTime === 0 || (currentTime < initialTime))) {
        return <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;
      }
    }
    // Default to Play if idle/paused and not a reset condition
    return <Play className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-primary-foreground" />;
  };

  const progressPercentage = initialTime > 0 ? ((initialTime - currentTime) / initialTime) * 100 : 0;

  const getAriaLabelForControl = () => {
    if (timerState === 'running') return 'Mettre en pause';
    if (pomodoroPhase) {
      if (timerState === 'idle' && (currentTime === 0 || currentTime < initialTime)) {
        return pomodoroPhase === 'long-break' && currentTime === 0 ? 'Nouvelle Session Pomodoro' : 'Réinitialiser la phase';
      }
    }
    return 'Démarrer';
  };

  const isPomodoroSessionActive = timerState === 'running' && pomodoroPhase !== null;

  return (
    <Card className="w-full max-w-xl h-full flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-2xl bg-card/60 dark:bg-card/40 border border-white/20 dark:border-white/10 rounded-[2rem] animate-fade-in relative z-10">
      <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-evenly p-2 sm:p-4 md:p-6 text-center">
        <audio ref={audioRef} src="/notification.mp3" preload="auto"></audio>
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent drop-shadow-sm mb-1 sm:mb-2">ChronoZen Pomodoro</h1>
          <p className="text-muted-foreground">Configurez et lancez votre session.</p>
        </div>

        <div className="w-full space-y-2 sm:space-y-4">
          <Button
            variant="default"
            onClick={pomodoroPhase === 'long-break' && currentTime === 0 && timerState === "idle" ? resetPomodoroState : handleStartPomodoro}
            className="w-full h-12 active:scale-95 transition-transform bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 rounded-xl font-semibold text-lg"
            disabled={timerState === 'running' && pomodoroPhase !== null && !(pomodoroPhase === 'long-break' && currentTime === 0)}
          >
            {pomodoroPhase === 'long-break' && currentTime === 0 && timerState === "idle" ? 'Démarrer Nouvelle Session' : 'Démarrer Session Pomodoro'}
          </Button>

          <div className="grid grid-cols-3 gap-x-4 w-full pt-2">
            <div className="flex flex-col">
              <Label htmlFor="workDuration" className="text-xs text-muted-foreground mb-1 self-start h-8">Travail (min)</Label>
              <Input
                id="workDuration"
                type="number"
                min="1"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(e.target.value)}
                disabled={isPomodoroSessionActive}
                className="h-11 text-sm w-full text-center bg-background/50 border-white/20 dark:border-white/10 backdrop-blur-sm rounded-xl font-medium"
                aria-label="Durée du travail en minutes"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="shortBreakDuration" className="text-xs text-muted-foreground mb-1 self-start h-8">Pause Courte (min)</Label>
              <Input
                id="shortBreakDuration"
                type="number"
                min="1"
                value={shortBreakMinutes}
                onChange={(e) => setShortBreakMinutes(e.target.value)}
                disabled={isPomodoroSessionActive}
                className="h-11 text-sm w-full text-center bg-background/50 border-white/20 dark:border-white/10 backdrop-blur-sm rounded-xl font-medium"
                aria-label="Durée de la pause courte en minutes"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="longBreakDuration" className="text-xs text-muted-foreground mb-1 self-start h-8">Pause Longue (min)</Label>
              <Input
                id="longBreakDuration"
                type="number"
                min="1"
                value={longBreakMinutes}
                onChange={(e) => setLongBreakMinutes(e.target.value)}
                disabled={isPomodoroSessionActive}
                className="h-11 text-sm w-full text-center bg-background/50 border-white/20 dark:border-white/10 backdrop-blur-sm rounded-xl font-medium"
                aria-label="Durée de la pause longue en minutes"
              />
            </div>
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
          <TimerDisplay seconds={currentTime} phase={pomodoroPhase} />
        </CircularProgress>

        <Button
          onClick={handleControlClick}
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full p-0 shadow-xl active:scale-95 transition-all bg-gradient-to-br from-primary to-accent hover:opacity-90 border border-white/20 flex-shrink-0"
          aria-label={getAriaLabelForControl()}
          disabled={pomodoroPhase === null && timerState === 'idle' && currentTime !== initialTime && currentTime !== 0}
        >
          {getControlIcon()}
        </Button>
        {pomodoroPhase && timerState !== "running" && (
          <Button
            variant="outline"
            size="sm"
            onClick={resetPomodoroState}
            className="mt-4 border-white/20 bg-background/30 backdrop-blur-md rounded-xl hover:bg-background/50 shadow-sm"
          >
            Réinitialiser la Session Pomodoro
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PomodoroController;
