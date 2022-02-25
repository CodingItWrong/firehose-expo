import {StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/Navigation';
import useTheme from './src/useTheme';

export default function App() {
  const theme = useTheme();
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Navigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
