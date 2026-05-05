import { StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider, useSafeAreaInsets
} from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { COLORS } from './app/constants/colors';
import { useEffect } from 'react';
import BootSplash from 'react-native-bootsplash';

function App() {
  
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    BootSplash.hide({ fade: true });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.primary }]}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
