import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AppState, Vibration } from 'react-native';
import { TabataConfig, PhaseInfo, TabataPhase, TimerStatus } from '../types/tabata';
import { schedulePhaseNotifications, cancelTabataNotifications } from '../services/tabataNotifications';
import Sound from 'react-native-sound';

export function getTotalDuration(config: TabataConfig): number {
  let total = config.prepare;
  for (let set = 1; set <= config.sets; set++) {
    for (let cycle = 1; cycle <= config.cycles; cycle++) {
      total += config.work;
      const isLastCycleLastSet = cycle === config.cycles && set === config.sets;
      if (!isLastCycleLastSet) {
        total += cycle === config.cycles ? config.restBetweenSets : config.rest;
      }
    }
  }
  return total + config.coolDown;
}

export function getPhaseAtElapsed(config: TabataConfig, elapsedSecs: number): PhaseInfo {
  const totalDuration = getTotalDuration(config);
  const clampedElapsed = Math.min(elapsedSecs, totalDuration);
  let t = Math.floor(clampedElapsed);

  if (t < config.prepare) {
    return { phase: 'prepare', remaining: config.prepare - t, currentCycle: 0, currentSet: 0, elapsed: clampedElapsed, totalDuration };
  }
  t -= config.prepare;

  for (let set = 1; set <= config.sets; set++) {
    for (let cycle = 1; cycle <= config.cycles; cycle++) {
      if (t < config.work) {
        return { phase: 'work', remaining: config.work - t, currentCycle: cycle, currentSet: set, elapsed: clampedElapsed, totalDuration };
      }
      t -= config.work;

      const isLastCycleLastSet = cycle === config.cycles && set === config.sets;
      if (!isLastCycleLastSet) {
        const restDuration = cycle === config.cycles ? config.restBetweenSets : config.rest;
        const phase: TabataPhase = cycle === config.cycles ? 'restBetweenSets' : 'rest';
        if (t < restDuration) {
          return { phase, remaining: restDuration - t, currentCycle: cycle, currentSet: set, elapsed: clampedElapsed, totalDuration };
        }
        t -= restDuration;
      }
    }
  }

  if (t < config.coolDown) {
    return { phase: 'coolDown', remaining: config.coolDown - t, currentCycle: config.cycles, currentSet: config.sets, elapsed: clampedElapsed, totalDuration };
  }

  return { phase: 'finished', remaining: 0, currentCycle: config.cycles, currentSet: config.sets, elapsed: totalDuration, totalDuration };
}

export function useTabataTimer(config: TabataConfig) {
  const totalDuration = useMemo(() => getTotalDuration(config), [config]);

  const [displayElapsed, setDisplayElapsed] = useState(0);
  const [status, setStatus] = useState<TimerStatus>('idle');

  const startTimestamp = useRef(0);
  const baseElapsed = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusRef = useRef<TimerStatus>('idle');
  const lastPhaseRef = useRef<TabataPhase | null>(null);

  const workSound = useRef<Sound | null>(null);
  const restSound = useRef<Sound | null>(null);
  const finishSoundRef = useRef<Sound | null>(null);
  const countdownSoundRef = useRef<Sound | null>(null);
  const lastCountdownSecRef = useRef(-1);
  const isFirstTickRef = useRef(true);

  const playSound = useCallback((sound?: Sound | null) => {
    if (!sound) return;
    sound.setCurrentTime(0);
    sound.play();
  }, []);

  useEffect(() => {
    Sound.setCategory('Playback', true);
    const loadSound = (file: string) => {
      const s = new Sound(file, Sound.MAIN_BUNDLE, (error) => {
        if (error) return;
        // OPTIMIZACIÓN: Forzar el pre-load en el buffer de Android
        s.setVolume(1);
        s.setSpeed(1);
        s.stop();
      });
      return s;
    };

    workSound.current = loadSound('whistle.wav');
    restSound.current = loadSound('rest.mp3');
    finishSoundRef.current = loadSound('gong.mp3');
    countdownSoundRef.current = loadSound('beep.wav');

    return () => {
      workSound.current?.release();
      restSound.current?.release();
      finishSoundRef.current?.release();
      countdownSoundRef.current?.release();
    };
  }, []);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const finish = useCallback(() => {
    clearTimer();
    baseElapsed.current = totalDuration;
    statusRef.current = 'finished';
    setStatus('finished');
    setDisplayElapsed(totalDuration);
    Vibration.vibrate([0, 200, 100, 200]);
    cancelTabataNotifications();
    finishSoundRef.current?.play();
  }, [totalDuration]);

  const skip = useCallback(() => {
    if (statusRef.current === 'finished') { return; }

    // Calculamos el elapsed actual
    const currentElapsed = statusRef.current === 'running'
      ? baseElapsed.current + (Date.now() - startTimestamp.current) / 1000
      : baseElapsed.current;

    // Encontramos el inicio de la siguiente fase sumando el remaining actual
    const currentInfo = getPhaseAtElapsed(config, currentElapsed);
    if (currentInfo.phase === 'finished') { return; }

    const nextElapsed = currentElapsed + currentInfo.remaining;

    if (nextElapsed >= totalDuration) {
      finish();
      return;
    }
    // Actualizamos base y reiniciamos el timestamp si está corriendo
    baseElapsed.current = nextElapsed;
    if (statusRef.current === 'running') {
      startTimestamp.current = Date.now();
    }

    lastPhaseRef.current = null;
    setDisplayElapsed(nextElapsed);
  }, [config, totalDuration, finish]);

  const tick = useCallback(() => {
    const e = baseElapsed.current + (Date.now() - startTimestamp.current) / 1000;
    if (e >= totalDuration) {
      finish();
      return;
    }
    setDisplayElapsed(e);

    const info = getPhaseAtElapsed(config, e);
    const isStart = e < 0.15;
    const prevInfo = getPhaseAtElapsed(config, e - 0.1); // 100ms antes

    if (!isStart) {
      if (prevInfo.phase !== info.phase) {
        Vibration.vibrate(info.phase === 'work' ? [0, 100, 50, 100] : [0, 100]);
        lastCountdownSecRef.current = -1;

        // Solo suena si no estamos en el arranque
        if (!isFirstTickRef.current) {
          if (info.phase === 'work') playSound(workSound.current);
          else if (['rest', 'restBetweenSets', 'coolDown'].includes(info.phase)) {
            playSound(restSound.current);
          }
        }
      }
    }
    if (e > 0.2) {
      isFirstTickRef.current = false;
    }
    const remainingFloor = Math.floor(info.remaining);
    if (
      info.phase !== 'finished' &&
      remainingFloor <= 3 &&
      remainingFloor > 0 &&
      remainingFloor !== lastCountdownSecRef.current
    ) {
      lastCountdownSecRef.current = remainingFloor;
      playSound(countdownSoundRef.current);
    }
  }, [totalDuration, finish, config, playSound]);

  const play = useCallback(() => {
    if (statusRef.current === 'finished') { return; }
    isFirstTickRef.current = true;
    startTimestamp.current = Date.now();
    statusRef.current = 'running';
    setStatus('running');
    clearTimer();
    intervalRef.current = setInterval(tick, 100);
  }, [tick]);

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') { return; }
    const e = baseElapsed.current + (Date.now() - startTimestamp.current) / 1000;
    baseElapsed.current = Math.min(e, totalDuration);
    clearTimer();
    statusRef.current = 'paused';
    setStatus('paused');
    setDisplayElapsed(baseElapsed.current);
    cancelTabataNotifications();
  }, [totalDuration]);

  const reset = useCallback(() => {
    clearTimer();
    baseElapsed.current = 0;
    startTimestamp.current = 0;
    lastPhaseRef.current = null;
    lastCountdownSecRef.current = -1;
    statusRef.current = 'idle';
    setStatus('idle');
    setDisplayElapsed(0);
    cancelTabataNotifications();
    isFirstTickRef.current = true;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', async nextState => {
      if ((nextState === 'background' || nextState === 'inactive') && statusRef.current === 'running') {
        const e = baseElapsed.current + (Date.now() - startTimestamp.current) / 1000;
        await schedulePhaseNotifications(config, e);
      } else if (nextState === 'active' && statusRef.current === 'running') {
        await cancelTabataNotifications();
        const e = baseElapsed.current + (Date.now() - startTimestamp.current) / 1000;
        if (e >= totalDuration) {
          finish();
        } else {
          setDisplayElapsed(e);
        }
      }
    });
    return () => sub.remove();
  }, [config, totalDuration, finish]);

  useEffect(() => () => clearTimer(), []);

  const phaseInfo = useMemo(() => getPhaseAtElapsed(config, displayElapsed), [config, displayElapsed]);

  return { phaseInfo, status, totalDuration, displayElapsed, play, pause, reset, skip };
}
