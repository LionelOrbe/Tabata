import { StyleSheet, View } from 'react-native';
import {
  SafeAreaProvider, useSafeAreaInsets
} from 'react-native-safe-area-context';
import AppNavigator from './app/navigation/AppNavigator';
import { COLORS } from './app/constants/colors';

function App() {
  
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: COLORS.dark }]}>
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
