import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import Animated, {
    useSharedValue, useAnimatedStyle, withTiming, runOnJS, withSequence, withDelay
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { TabataConfig } from '../types/tabata';
import { getTotalDuration } from '../hooks/useTabataTimer';
import { COLORS } from '../constants/colors';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const SWIPE_THRESHOLD = 80;

export default function SwipeableCard({
    item, onDelete, onEdit, onStart, isNew
}: {
    item: TabataConfig;
    onDelete: () => void;
    onEdit: () => void;
    onStart: () => void;
    isNew?: boolean;
}) {

    const translateX = useSharedValue(0);
    const total = getTotalDuration(item);

    useEffect(() => {
    const runHint = async () => {
        if (!isNew) {
            // Espera 1200ms para que el usuario ya esté mirando
            translateX.value = withDelay(1200,
                withSequence(
                    withTiming(85, { duration: 600 }),
                    withTiming(75, { duration: 500 }),
                    withTiming(0,  { duration: 300 })
                )
            );
        }
    };
    runHint();
}, [isNew, translateX]);

    function formatDuration(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    }

    const pan = Gesture.Pan()
        .activeOffsetX([-15, 15])
        .failOffsetY([-10, 10])  
        .onUpdate(e => {
            if (e.translationX > 0) translateX.value = e.translationX;
        })
        .onEnd(e => {
            if (e.translationX > SWIPE_THRESHOLD) {
                translateX.value = withTiming(400, { duration: 250 }, () => {
                    runOnJS(onDelete)();
                });
            } else {
                translateX.value = withTiming(0);
            }
        });

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const redOpacity = useAnimatedStyle(() => ({
        opacity: translateX.value / SWIPE_THRESHOLD,
    }));

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={styles.swipeContainer}>
                {/* Fondo rojo que aparece mientras arrastrás */}
                <Animated.View style={[styles.deleteBackground, redOpacity]}>
                    <MaterialDesignIcons name="trash-can-outline" size={22} color={'#FFF'} />
                    <Text style={styles.deleteLabel}>Eliminar</Text>
                </Animated.View>
                <Animated.View style={[styles.card, animStyle]}>
                    <View style={styles.cardBorder} />
                    <View style={styles.cardLeft}>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardSub}>
                            {item.sets} serie{item.sets !== 1 ? 's' : ''} · {item.cycles} ciclo{item.cycles !== 1 ? 's' : ''} · {item.work}s trabajo / {item.rest}s descanso
                        </Text>
                        <Text style={styles.cardTotal}>Total: {formatDuration(total)}</Text>
                    </View>
                    <View style={styles.cardRight}>
                        <TouchableOpacity onPress={onEdit}>
                            <MaterialDesignIcons name="pencil-outline" size={22} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onStart} style={styles.playBtn}>
                            <MaterialDesignIcons name="play" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        paddingLeft: 32, // Deja espacio para el cardBorder
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative', // Asegura que cardBorder use height 100%
        boxShadow: '0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.3)',
    },
    cardLeft: { flex: 1 },
    cardName: { fontSize: 17, fontWeight: '700', color: '#000', marginBottom: 4 },
    cardSub: { fontSize: 13, color: '#666', marginBottom: 2 },
    cardTotal: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
    cardRight: { alignItems: 'center', gap: 10 },
    cardBorder: {
        width: 16,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    swipeContainer: {
        // marginBottom: 12,
        borderRadius: 16,
    },
    deleteBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        backgroundColor: COLORS.red,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        gap: 8,
    },
    deleteLabel: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
    playBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 8,
    },
})