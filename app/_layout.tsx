import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useColorScheme } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store, persistor } from '../src/redux/store';
import { lightTheme, darkTheme } from '../src/theme/theme';
import AppNavigator from '../src/navigation/AppNavigator';
import '../global.css';

export default function RootLayout() {
  useFrameworkReady();
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}