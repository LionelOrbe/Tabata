import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { TabataConfig } from '../types/tabata';
import { COLORS } from '../constants/colors';
import { deleteWorkoutLog } from '../services/tabataStorage';

type Props = {
    navigation: NativeStackNavigationProp<any>;
    route: any;
};

function formatTotalTime(seconds: number): string {
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

export default function WorkoutDetailScreen({ navigation, route }: Props) {
    const workout: TabataConfig = route.params.workout;
    const [localLogs, setLocalLogs] = useState([...(workout.logs ?? [])].reverse());

    const completed = localLogs.filter(l => l.completed).length;   // 👈 localLogs
    const incomplete = localLogs.filter(l => !l.completed).length; // 👈 localLogs

    const handleDeleteLog = (idx: number) => {
        Alert.alert('Eliminar sesión', '¿Estás seguro?', [
            { text: 'Cancelar' },
            {
                text: 'Eliminar', style: 'destructive', onPress: async () => {
                    await deleteWorkoutLog(workout.id, idx);
                    setLocalLogs(prev => prev.filter((_, i) => i !== idx));
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialDesignIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>{workout.name}</Text>
                <View style={{ width: 32 }} />
            </View>


            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{completed}</Text>
                    <Text style={styles.statLabel}>Completados</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{incomplete}</Text>
                    <Text style={styles.statLabel}>Incompletos</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{localLogs.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
            </View>

            <View style={styles.divider} />

            {/* Lista */}
            {localLogs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialDesignIcons name="clipboard-text-outline" size={48} color="#ddd" />
                    <Text style={styles.emptyText}>Todavía no hay sesiones registradas</Text>
                </View>
            ) : (
                <FlatList
                    data={localLogs}
                    keyExtractor={(_, idx) => idx.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: log, index }) => (
                        <View style={styles.logRow}>
                            <MaterialDesignIcons
                                name={log.completed ? 'check-circle' : 'alert-circle'}
                                size={22}
                                color={log.completed ? COLORS.green : COLORS.red}
                            />
                            <View style={styles.logInfo}>
                                <Text style={styles.logDate}>{formatDate(log.date)} · {log.time}</Text>
                                <Text style={styles.logTime}>{formatTotalTime(log.totalTime)}</Text>
                            </View>
                            {/* <Text style={[styles.logStatus, { color: log.completed ? COLORS.green : COLORS.red }]}>
                                {log.completed ? 'Completado' : 'Incompleto'}
                            </Text> */}
                            <TouchableOpacity onPress={() => handleDeleteLog(index)} style={styles.deleteBtn}>
                                <MaterialDesignIcons name="trash-can-outline" size={20} color={COLORS.secondary} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
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
    title: { color: '#fff', fontSize: 18, fontWeight: '700' },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginTop: 16,
        borderTopWidth: 2,
        borderColor: COLORS.primary,
        borderBottomWidth: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111',
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#f0f0f0',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#aaa',
    },
    listContent: {
        gap: 1,
        marginTop: 5,
        paddingBottom: 30,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        gap: 15,
    },
    logInfo: {
        flex: 1,
    },
    logDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    logTime: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    logStatus: {
        fontSize: 13,
        fontWeight: '600',
    },
    deleteBtn: {
        padding: 4,
    },
});