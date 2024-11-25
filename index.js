import { registerRootComponent } from 'expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // Gesture Handler Root

import App from './App';

// Wrap App with GestureHandlerRootView
registerRootComponent(() => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <App />
  </GestureHandlerRootView>
));
