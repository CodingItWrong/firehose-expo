import {useFocusEffect} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {QueryClient, QueryClientProvider} from 'react-query';
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
  });
  return (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <QueryClientProvider client={queryClient}>
        <TokenProvider skipLoading>{children}</TokenProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
