import {StatusBar} from 'expo-status-bar';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/Navigation';
import TokenLoadBuffer from './src/components/TokenLoadBuffer';
import {TokenProvider} from './src/data/token';
import useTheme from './src/useTheme';

export default function App() {
  const theme = useTheme();
  // Token components must be outermost to prevent flash of white screen
  return (
    <TokenProvider>
      <TokenLoadBuffer>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <Navigation />
          </SafeAreaProvider>
        </PaperProvider>
      </TokenLoadBuffer>
    </TokenProvider>
  );
}
