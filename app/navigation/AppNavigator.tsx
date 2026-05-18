import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import TabataHomeScreen from '../screens/TabataHomeScreen';
import TabataConfigScreen from '../screens/TabataConfigScreen';
import TabataTimerScreen from '../screens/TabataTimerScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BootSplash from "react-native-bootsplash";
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer onReady={() => {
      requestAnimationFrame(() => {
        BootSplash.hide({ fade: true });
      });
    }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="TabataHome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TabataHome" component={TabataHomeScreen} options={{ headerBackVisible: false, headerLeft: () => null }} />
          <Stack.Screen name="TabataConfig" component={TabataConfigScreen} />
          <Stack.Screen name="TabataTimer" component={TabataTimerScreen} />
          <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}