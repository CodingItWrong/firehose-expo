import {StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Navigation from './src/Navigation';

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <Navigation />
      </SafeAreaProvider>
    </PaperProvider>
  );
}
