import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../constants/colors';
import { TabataConfig } from '../../types/tabata';
import { getWorkouts, deleteWorkout } from '../../services/tabataStorage';
import { getTotalDuration } from '../../hooks/useTabataTimer';
import { setupNotificationChannel, requestNotificationPermission } from '../../services/tabataNotifications';

type Props = { navigation: NativeStackNavigationProp<any> };

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export default function TabataHomeScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<TabataConfig[]>([]);

  useFocusEffect(
    useCallback(() => {
      getWorkouts().then(setWorkouts);
      setupNotificationChannel();
      requestNotificationPermission();
    }, []),
  );

  const handleDelete = (item: TabataConfig) => {
    Alert.alert('Eliminar entrenamiento', `¿Eliminar "${item.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(item.id);
          setWorkouts(prev => prev.filter(w => w.id !== item.id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: TabataConfig }) => {
    const total = getTotalDuration(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('TabataTimer', { config: item })}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardSub}>
            {item.sets} serie{item.sets !== 1 ? 's' : ''} · {item.cycles} ciclo{item.cycles !== 1 ? 's' : ''} · {item.work}s trabajo / {item.rest}s descanso
          </Text>
          <Text style={styles.cardTotal}>Total: {formatDuration(total)}</Text>
        </View>
        <View style={styles.cardRight}>
          <TouchableOpacity onPress={() => navigation.navigate('TabataConfig', { config: item })}>
            <Icon name="pencil-outline" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('TabataTimer', { config: item })} style={styles.playBtn}>
            <Icon name="play" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Timer Tabata</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabataConfig', {})} style={styles.addBtn}>
          <Icon name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={workouts.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="timer-outline" size={72} color={COLORS.accent} />
            <Text style={styles.emptyTitle}>Sin entrenamientos</Text>
            <Text style={styles.emptyText}>Toca + para crear tu primer entrenamiento Tabata</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: { padding: 4 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 4,
  },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 12,
  },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  cardSub: { fontSize: 13, color: '#666', marginBottom: 2 },
  cardTotal: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  cardRight: { alignItems: 'center', gap: 10 },
  playBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
  },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});
