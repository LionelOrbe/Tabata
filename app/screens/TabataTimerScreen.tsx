import React, { useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { TabataConfig, TabataPhase, WorkoutLog } from '../types/tabata';
import { useTabataTimer } from '../hooks/useTabataTimer';
import KeepAwake from '@sayem314/react-native-keep-awake';
import { saveWorkoutLog } from '../services/tabataStorage';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: any;
};

const PHASE_COLORS: Record<TabataPhase, string> = {
  prepare: '#2980B9',
  work: '#C0392B',
  rest: '#27AE60',
  restBetweenSets: '#8E44AD',
  coolDown: '#E67E22',
  finished: '#16A085',
};

const PHASE_LABELS: Record<TabataPhase, string> = {
  prepare: 'Prepárate',
  work: '¡Trabaja!',
  rest: 'Descansa',
  restBetweenSets: 'Descanso entre series',
  coolDown: 'Enfriamiento',
  finished: '¡Completado!',
};

const PHASE_ICONS: Record<TabataPhase,
  | "clock-outline"
  | "lightning-bolt"
  | "leaf"
  | "coffee"
  | "snowflake"
  | "trophy"
> = {
  prepare: 'clock-outline',
  work: 'lightning-bolt',
  rest: 'leaf',
  restBetweenSets: 'coffee',
  coolDown: 'snowflake',
  finished: 'trophy',
};

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(s / 60);
  const secs = s % 60;
  return `${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TabataTimerScreen({ navigation, route }: Props) {
  const config: TabataConfig = route.params.config;
  const { phaseInfo, status, totalDuration, displayElapsed, realElapsed, play, pause, reset, skip } = useTabataTimer(config);

  const bgColor = PHASE_COLORS[phaseInfo.phase];
  const progressPct = totalDuration > 0 ? Math.min(displayElapsed / totalDuration, 1) * 100 : 0;

  useEffect(() => {
    if (phaseInfo.phase !== 'finished') return;

    const now = new Date();
    const log: WorkoutLog = {
      date: now.toISOString().split('T')[0],          // '2026-05-15'
      time: now.toTimeString().slice(0, 5),            // '14:32'
      completed: true,
      totalTime: realElapsed,
    };
    saveWorkoutLog(config.id, log);
  }, [config.id, realElapsed, phaseInfo.phase]);

  const handleBack = () => {
    const saveIncomplete = () => {
      if (displayElapsed > 0 && status !== 'finished') {
        const now = new Date();
        saveWorkoutLog(config.id, {
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().slice(0, 5),
          completed: false,
          totalTime: realElapsed,
        });
      }
    };

    if (status === 'running') {
      pause();
      Alert.alert('Salir del entrenamiento', '¿Deseas salir? El progreso se perderá.', [
        { text: 'Continuar', onPress: play },
        {
          text: 'Salir', style: 'destructive', onPress: () => {
            saveIncomplete();
            reset();
            navigation.goBack();
          }
        },
      ]);
    } else if (status === 'paused') {
      Alert.alert('Salir del entrenamiento', '¿Deseas salir? El progreso se perderá.', [
        { text: 'Continuar' },
        {
          text: 'Salir', style: 'destructive', onPress: () => {
            saveIncomplete();
            reset();
            navigation.goBack();
          }
        },
      ]);
    } else {
      saveIncomplete();
      reset();
      navigation.goBack();
    }
  };

  const togglePlay = () => {
    if (status === 'running') {
      pause();
    } else if (status !== 'finished') {
      play();
    }
  };

  const skipPhase = () => {
    if (typeof phaseInfo.phase !== 'undefined' && status !== 'finished') {
      skip();
    }
  };

  const isFinished = phaseInfo.phase === 'finished';

  const phaseProgressPct = useMemo(() => {
    if (isFinished) { return 100; }
    const { phase } = phaseInfo;
    let phaseDuration = 0;
    if (phase === 'prepare') { phaseDuration = config.prepare; }
    else if (phase === 'work') { phaseDuration = config.work; }
    else if (phase === 'rest') { phaseDuration = config.rest; }
    else if (phase === 'restBetweenSets') { phaseDuration = config.restBetweenSets; }
    else if (phase === 'coolDown') { phaseDuration = config.coolDown; }
    if (phaseDuration === 0) { return 0; }
    return Math.min(100, (1 - phaseInfo.remaining / phaseDuration) * 100);
  }, [phaseInfo, config, isFinished]);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar backgroundColor={bgColor} barStyle="light-content" />
      {status === 'running' && <KeepAwake />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <MaterialDesignIcons name="arrow-left" size={24} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
        <Text style={styles.workoutName} numberOfLines={1}>{config.name}</Text>
        <TouchableOpacity onPress={reset} style={styles.resetBtn}>
          <MaterialDesignIcons name="restart" size={22} color="rgba(255,255,255,0.9)" />
        </TouchableOpacity>
      </View>

      {/* Progress bar total */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPct.toFixed(1)}%` as any }]} />
      </View>

      {/* Set / Cycle info */}
      {!isFinished && phaseInfo.currentSet > 0 && (
        <View style={styles.counters}>
          <View style={styles.counterBadge}>
            <Text style={styles.counterLabel}>Serie</Text>
            <Text style={styles.counterValue}>{phaseInfo.currentSet}/{config.sets}</Text>
          </View>
          <View style={styles.counterDot} />
          <View style={styles.counterBadge}>
            <Text style={styles.counterLabel}>Ciclo</Text>
            <Text style={styles.counterValue}>{phaseInfo.currentCycle}/{config.cycles}</Text>
          </View>
        </View>
      )}

      {/* Phase display */}
      <View style={styles.centerArea}>
        <MaterialDesignIcons name={PHASE_ICONS[phaseInfo.phase]} size={56} color="rgba(255,255,255,0.85)" style={styles.phaseIcon} />

        <Text style={styles.phaseLabel}>{PHASE_LABELS[phaseInfo.phase]}</Text>

        {isFinished ? (
          <Text style={styles.finishedEmoji}>🎉</Text>
        ) : (
          <Text style={styles.countdown}>{formatTime(phaseInfo.remaining)}</Text>
        )}

        {/* Phase progress bar */}
        {!isFinished && (
          <View style={styles.phaseProgressTrack}>
            <View style={[styles.phaseProgressFill, { width: `${phaseProgressPct.toFixed(1)}%` as any }]} />
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isFinished ? (
            <TouchableOpacity style={[styles.mainBtn, { marginBottom: 45 }]} onPress={reset}>
              <MaterialDesignIcons name="restart" size={32} color="#fff" />
              <Text style={styles.mainBtnText}>Repetir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.mainBtn} onPress={togglePlay}>
              <MaterialDesignIcons name={status === 'running' ? 'pause' : 'play'} size={36} color="#fff" />
              <Text style={styles.mainBtnText}>{status === 'running' ? 'Pausa' : status === 'paused' ? 'Reanudar' : 'Iniciar'}</Text>
            </TouchableOpacity>
          )}
          {status === 'running' && !isFinished && (
            <TouchableOpacity style={[styles.skipBtn, { marginRight: 24 }]} onPress={skipPhase}>
              <MaterialDesignIcons name="skip-next" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Total time remaining */}
      {!isFinished && (
        <Text style={styles.totalRemaining}>
          Tiempo total restante: {formatTime(totalDuration - displayElapsed)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: { padding: 8 },
  workoutName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  resetBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 16,
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  counters: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  counterBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
  },
  counterLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  counterValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  counterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  phaseIcon: { marginBottom: 12 },
  phaseLabel: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  countdown: {
    color: '#fff',
    fontSize: 90,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  finishedEmoji: { fontSize: 80 },
  phaseProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    width: '80%',
    marginTop: 32,
    overflow: 'hidden',
  },
  phaseProgressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  controls: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  mainBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 100,
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    gap: 4,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
  },
  mainBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  totalRemaining: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    textAlign: 'center',
    paddingBottom: 16,
    marginBottom: 10,
  },
  skipBtn: {
    position: 'absolute',
    left: 135,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
  },
});
