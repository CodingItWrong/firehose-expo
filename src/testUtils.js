import {useFocusEffect} from '@react-navigation/native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from './data/token';

export function jsonApiResponseBody(records, meta = null) {
  return {data: records, meta};
}

export const safeAreaMetrics = {
  frame: {
    width: 320,
    height: 640,
    x: 0,
    y: 0,
  },
  insets: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
};

// provide mock implementation of useFocusEffect to run once each time callback changes
//
// requires running this in the test file:
//
//  jest.mock('@react-navigation/native', () => ({
//    useFocusEffect: jest.fn(),
//    // ...
//  }));
export function mockUseFocusEffect() {
  let lastCallback = null;
  useFocusEffect.mockImplementation(callback => {
    if (lastCallback !== callback) {
      lastCallback = callback;
      callback();
    }
  });
}

export function providers(children) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <TokenProvider skipLoading>{children}</TokenProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
