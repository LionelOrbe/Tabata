import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import TabataHomeScreen from '../screens/TabataHomeScreen';
import TabataConfigScreen from '../screens/TabataConfigScreen';
import TabataTimerScreen from '../screens/TabataTimerScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="TabataHome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="TabataHome" component={TabataHomeScreen} options={{ headerBackVisible: false, headerLeft: () => null }} />
          <Stack.Screen name="TabataConfig" component={TabataConfigScreen} />
          <Stack.Screen name="TabataTimer" component={TabataTimerScreen} />
        </Stack.Navigator>
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}