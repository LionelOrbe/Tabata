import { StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: 20,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        color: COLORS.primary,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 6
    }
});
