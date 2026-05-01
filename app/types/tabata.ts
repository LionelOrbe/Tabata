export interface TabataConfig {
  id: string;
  name: string;
  prepare: number;       // segundos
  work: number;          // segundos
  rest: number;          // segundos
  cycles: number;        // repeticiones trabajo+descanso por serie
  sets: number;          // número de series
  restBetweenSets: number; // segundos entre series
  coolDown: number;      // segundos
  createdAt: number;
}

export type TabataPhase =
  | 'prepare'
  | 'work'
  | 'rest'
  | 'restBetweenSets'
  | 'coolDown'
  | 'finished';

export interface PhaseInfo {
  phase: TabataPhase;
  remaining: number;
  currentCycle: number;
  currentSet: number;
  elapsed: number;
  totalDuration: number;
}

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';
