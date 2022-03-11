import {StatusBar} from 'expo-status-bar';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/Navigation';
import {TokenProvider} from './src/data/token';
import useTheme from './src/useTheme';

export default function App() {
  const theme = useTheme();
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <TokenProvider>
          <Navigation />
        </TokenProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
