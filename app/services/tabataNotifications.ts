import notifee, { AndroidImportance, TriggerType } from '@notifee/react-native';
import { TabataConfig } from '../types/tabata';

const CHANNEL_ID = 'tabata-timer';

export const PHASE_LABELS: Record<string, string> = {
  prepare: '¡Prepárate!',
  work: '¡A trabajar!',
  rest: 'Descansa',
  restBetweenSets: 'Descanso entre series',
  coolDown: 'Enfriamiento',
  finished: '¡Completado!',
};

export async function setupNotificationChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Tabata Timer',
    importance: AndroidImportance.HIGH,
    vibration: false,
    sound: 'none',
  });
}

export async function requestNotificationPermission() {
  return await notifee.requestPermission();
}

export async function cancelTabataNotifications() {
  try {
    await notifee.cancelAllNotifications();
  } catch { /* ignore */ }
}

function getPhaseTransitions(config: TabataConfig): { elapsed: number; phase: string }[] {
  const result: { elapsed: number; phase: string }[] = [];
  let t = config.prepare;

  result.push({ elapsed: t, phase: 'work' });

  for (let set = 1; set <= config.sets; set++) {
    for (let cycle = 1; cycle <= config.cycles; cycle++) {
      t += config.work;
      const isLastCycleLastSet = cycle === config.cycles && set === config.sets;
      if (!isLastCycleLastSet) {
        if (cycle === config.cycles) {
          result.push({ elapsed: t, phase: 'restBetweenSets' });
          t += config.restBetweenSets;
          result.push({ elapsed: t, phase: 'work' });
        } else {
          result.push({ elapsed: t, phase: 'rest' });
          t += config.rest;
          result.push({ elapsed: t, phase: 'work' });
        }
      }
    }
  }

  result.push({ elapsed: t, phase: 'coolDown' });
  t += config.coolDown;
  result.push({ elapsed: t, phase: 'finished' });

  return result;
}

export async function schedulePhaseNotifications(config: TabataConfig, currentElapsed: number) {
  try {
    await cancelTabataNotifications();

    const transitions = getPhaseTransitions(config);
    const pending = transitions.filter(t => t.elapsed > currentElapsed).slice(0, 50);
    const now = Date.now();

    for (let i = 0; i < pending.length; i++) {
      const tr = pending[i];
      const delay = (tr.elapsed - currentElapsed) * 1000;
      await notifee.createTriggerNotification(
        {
          id: `tabata-phase-${i}`,
          title: 'Tabata Timer',
          body: PHASE_LABELS[tr.phase] || tr.phase,
          android: { channelId: CHANNEL_ID, importance: AndroidImportance.HIGH },
          ios: { sound: 'default' },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: now + delay,
        },
      );
    }
  } catch { /* ignore */ }
}
