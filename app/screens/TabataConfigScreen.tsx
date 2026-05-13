import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { COLORS } from '../constants/colors';
import { TabataConfig } from '../types/tabata';
import { saveWorkout } from '../services/tabataStorage';
import { getTotalDuration } from '../hooks/useTabataTimer';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: any; 
};

const DEFAULT_CONFIG: Omit<TabataConfig, 'id' | 'name' | 'createdAt'> = {
  prepare: 10,
  work: 20,
  rest: 10,
  cycles: 8,
  sets: 1,
  restBetweenSets: 60,
  coolDown: 30,
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) { return `${s} seg`; }
  return s === 0 ? `${m} min` : `${m} min ${s} seg`;
}

interface FieldConfig {
  key: keyof Omit<TabataConfig, 'id' | 'name' | 'createdAt'>;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'prepare', label: 'Preparación', unit: 'seg', min: 0, max: 300, step: 5 },
  { key: 'work', label: 'Trabajo', unit: 'seg', min: 5, max: 300, step: 5 },
  { key: 'rest', label: 'Descanso', unit: 'seg', min: 0, max: 300, step: 5 },
  { key: 'cycles', label: 'Ciclos', unit: 'ciclos', min: 1, max: 50, step: 1 },
  { key: 'sets', label: 'Series', unit: 'series', min: 1, max: 20, step: 1 },
  { key: 'restBetweenSets', label: 'Descanso entre series', unit: 'seg', min: 0, max: 600, step: 5 },
  { key: 'coolDown', label: 'Enfriamiento', unit: 'seg', min: 0, max: 300, step: 5 },
];

export default function TabataConfigScreen({ navigation, route }: Props) {
  const existing: TabataConfig | undefined = route.params?.config;

  const [name, setName] = useState(existing?.name ?? '');
  const [values, setValues] = useState<Omit<TabataConfig, 'id' | 'name' | 'createdAt'>>({
    prepare: existing?.prepare ?? DEFAULT_CONFIG.prepare,
    work: existing?.work ?? DEFAULT_CONFIG.work,
    rest: existing?.rest ?? DEFAULT_CONFIG.rest,
    cycles: existing?.cycles ?? DEFAULT_CONFIG.cycles,
    sets: existing?.sets ?? DEFAULT_CONFIG.sets,
    restBetweenSets: existing?.restBetweenSets ?? DEFAULT_CONFIG.restBetweenSets,
    coolDown: existing?.coolDown ?? DEFAULT_CONFIG.coolDown,
  });

  const adjust = (key: FieldConfig['key'], delta: number, min: number, max: number) => {
    setValues(prev => ({ ...prev, [key]: Math.min(max, Math.max(min, prev[key] + delta)) }));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Nombre requerido', 'Por favor ingresa un nombre para el entrenamiento.');
      return;
    }
    const config: TabataConfig = {
      id: existing?.id ?? Date.now().toString(),
      name: trimmedName,
      ...values,
      createdAt: existing?.createdAt ?? Date.now(),
    };
    await saveWorkout(config);
    navigation.goBack();
  };

  const previewConfig = { id: '', name, createdAt: 0, ...values };
  const total = getTotalDuration(previewConfig);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialDesignIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{existing ? 'Editar entrenamiento' : 'Nuevo entrenamiento'}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Nombre */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Nombre del entrenamiento</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Tabata clásico"
            placeholderTextColor="#aaa"
            maxLength={40}
          />
        </View>

        {/* Parámetros */}
        <View style={styles.card}>
          {FIELDS.map((field, idx) => (
            <View key={field.key}>
              {idx > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <Text style={styles.rowLabel}>{field.label}</Text>
                <View style={styles.stepper}>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => adjust(field.key, -field.step, field.min, field.max)}
                  >
                    <MaterialDesignIcons name="minus" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.stepValue}>
                    {values[field.key]}
                    <Text style={styles.stepUnit}> {field.unit}</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.stepBtn}
                    onPress={() => adjust(field.key, field.step, field.min, field.max)}
                  >
                    <MaterialDesignIcons name="plus" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <MaterialDesignIcons name="timer-outline" size={22} color={COLORS.primary} />
          <Text style={styles.totalText}>Duración total: <Text style={styles.totalValue}>{formatDuration(total)}</Text></Text>
        </View>

        {/* Guardar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <MaterialDesignIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Guardar entrenamiento</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.dark,
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
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  fieldLabel: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  nameInput: {
    fontSize: 17,
    color: '#1a1a1a',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.accent,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: { fontSize: 15, color: '#333', fontWeight: '500', flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', minWidth: 70, textAlign: 'center' },
  stepUnit: { fontSize: 12, fontWeight: '400', color: '#888' },
  divider: { height: 1, backgroundColor: '#f0f0f0' },
  totalCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  totalText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  totalValue: { color: COLORS.primary, fontWeight: '700' },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
