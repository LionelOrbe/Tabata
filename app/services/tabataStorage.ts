import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabataConfig } from '../types/tabata';

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
    workouts[idx] = config;
  } else {
    workouts.unshift(config);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(workouts));
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  await AsyncStorage.setItem(KEY, JSON.stringify(workouts.filter(w => w.id !== id)));
}
