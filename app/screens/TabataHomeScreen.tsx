import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { COLORS } from '../constants/colors';
import { TabataConfig } from '../types/tabata';
import { getWorkouts, deleteWorkout } from '../services/tabataStorage';
import { setupNotificationChannel, requestNotificationPermission } from '../services/tabataNotifications';
import SwipeableCard from '../components/card';
import AboutModal from '../components/aboutModal';

type Props = { navigation: NativeStackNavigationProp<any> };

export default function TabataHomeScreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<TabataConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getWorkouts().then(setWorkouts);
      setupNotificationChannel();
      requestNotificationPermission();
      setLoading(false);
    }, []),
  );

  const handleDelete = async (item: TabataConfig) => {
    await deleteWorkout(item.id);
    setWorkouts(prev => prev.filter(w => w.id !== item.id));
  };

  const renderItem = ({ item }: { item: TabataConfig }) => {
    return (
      <SwipeableCard
        item={item}
        onDelete={() => handleDelete(item)}
        onEdit={() => navigation.navigate('TabataConfig', { config: item })}
        onStart={() => navigation.navigate('TabataTimer', { config: item })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowAbout(true)} style={styles.addBtn}>
          <MaterialDesignIcons name="information-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Entrenamientos</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TabataConfig', {})} style={styles.addBtn}>
          <MaterialDesignIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={workouts}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={workouts.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          loading ? <ActivityIndicator size="large" color="#fff" style={{ marginTop: 240 }} /> :
          <View style={styles.empty}>
            <MaterialDesignIcons name="timer-outline" size={72} color={'#FFF'} />
            <Text style={styles.emptyTitle}>Sin entrenamientos</Text>
            <Text style={styles.emptyText}>Toca + para crear tu primer entrenamiento Tabata</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} />
    </View>
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
  },
  backBtn: { padding: 4 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    padding: 4,
  },
  list: { padding: 16, gap: 12 },
  emptyContainer: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },
});
