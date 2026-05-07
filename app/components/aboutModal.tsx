import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { COLORS } from '../constants/colors';

type Props = {
    visible: boolean;
    onClose: () => void;
};

const MY_PORTFOLIO = 'https://lionelorbe.vercel.app/';

export default function AboutModal({ visible, onClose }: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity style={styles.card} activeOpacity={1} onPress={() => { }}>

                    {/* Handle bar */}
                    <View style={styles.handle} />

                    {/* Close button */}
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <MaterialDesignIcons name="close" size={22} color="#666" />
                    </TouchableOpacity>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <MaterialDesignIcons name="timer" size={52} color="#fff" />
                    </View>

                    {/* Info */}
                    <Text style={styles.appName}>Timer Tabata</Text>
                    <Text style={styles.version}>Versión 1.0.0</Text>

                    <View style={styles.divider} />

                    <Text style={styles.description}>
                        Entrenamiento por intervalos de alta intensidad. Configurá tus series, ciclos y tiempos de trabajo y descanso.
                    </Text>

                    <View style={styles.divider} />

                    {/* Rows de info */}
                    <TouchableOpacity
                        style={styles.infoRow}
                        onPress={() => Linking.openURL(MY_PORTFOLIO)}
                    >
                        <MaterialDesignIcons name="account-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.infoLabel}>Desarrollado por</Text>
                        <View style={styles.infoValueRow}>
                            <Text style={[styles.infoValue, { color: COLORS.primary }]}>Lionel Orbe</Text>
                            <MaterialDesignIcons name="open-in-new" size={14} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.infoRow}>
                        <MaterialDesignIcons name="code-tags" size={18} color={COLORS.primary} />
                        <Text style={styles.infoLabel}>Tecnología</Text>
                        <Text style={styles.infoValue}>React Native</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MaterialDesignIcons name="calendar-outline" size={18} color={COLORS.primary} />
                        <Text style={styles.infoLabel}>Año</Text>
                        <Text style={styles.infoValue}>2026</Text>
                    </View>

                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#ddd',
        marginBottom: 16,
    },
    closeBtn: {
        alignSelf: 'flex-end',
        padding: 4,
        marginBottom: 16,
    },
    iconContainer: {
        width: 88,
        height: 88,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    version: {
        fontSize: 13,
        color: '#999',
        marginBottom: 16,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 16,
    },
    description: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 22,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 10,
        paddingVertical: 8,
    },
    infoLabel: {
        flex: 1,
        fontSize: 14,
        color: '#888',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    infoValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
});