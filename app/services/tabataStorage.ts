import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabataConfig, WorkoutLog } from '../types/tabata';

const KEY = '@tabata_workouts';

export async function getWorkouts(): Promise<TabataConfig[]> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveWorkout(config: TabataConfig): Promise<void> {
  const workouts = await getWorkouts();
  const idx = workouts.findIndex(w => w.id === config.id);
  if (idx >= 0) {
    workouts[idx] = { ...workouts[idx], ...config, logs: workouts[idx].logs };
  } else {
    workouts.unshift(config);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(workouts));
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  await AsyncStorage.setItem(KEY, JSON.stringify(workouts.filter(w => w.id !== id)));
}

export async function saveWorkoutLog(id: string, log: WorkoutLog): Promise<void> {
    const workouts = await getWorkouts();
    const idx = workouts.findIndex(w => w.id === id);
    if (idx < 0) return;

    workouts[idx].logs = [...(workouts[idx].logs ?? []), log];
    await AsyncStorage.setItem(KEY, JSON.stringify(workouts));
}

export async function deleteWorkoutLog(workoutId: string, logIndex: number): Promise<void> {
    const workouts = await getWorkouts();
    const idx = workouts.findIndex(w => w.id === workoutId);
    if (idx < 0) return;

    const reversedIndex = (workouts[idx].logs?.length ?? 0) - 1 - logIndex;
    workouts[idx].logs?.splice(reversedIndex, 1);
    await AsyncStorage.setItem(KEY, JSON.stringify(workouts));
}
