import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {useToken} from '../data/token';
import CustomNavigationDrawer from './CustomNavigationDrawer';

const safeAreaMetrics = {
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

jest.mock('../data/token', () => ({useToken: jest.fn()}));

describe('CustomNavigationDrawer', () => {
  it('renders the navigation items', () => {
    useToken.mockReturnValue({});

    const route1 = {key: 'route1', name: 'Route 1'};
    const route2 = {key: 'route2', name: 'Route 2'};
    const state = {
      routes: [route1, route2],
    };
    const navigation = {navigate: jest.fn()};
    render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <CustomNavigationDrawer state={state} navigation={navigation} />
      </SafeAreaProvider>,
    );

    expect(screen.queryByText(route1.name)).not.toBeNull();
    expect(screen.queryByText(route2.name)).not.toBeNull();

    fireEvent.press(screen.getByText(route1.name));
    expect(navigation.navigate).toHaveBeenCalledWith(route1.name);
  });

  describe('sign out', () => {
    it('does not render the sign out button when already signed out', () => {
      useToken.mockReturnValue({isLoggedIn: false});
      const state = {routes: []};

      render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <CustomNavigationDrawer state={state} />
        </SafeAreaProvider>,
      );

      expect(screen.queryByText('Sign out')).toBeNull();
    });

    it('renders the sign out button when signed in', async () => {
      const clearToken = jest.fn().mockResolvedValue();
      useToken.mockReturnValue({isLoggedIn: true, clearToken});
      const state = {routes: []};
      const navigation = {navigate: jest.fn()};

      render(
        <SafeAreaProvider initialMetrics={safeAreaMetrics}>
          <CustomNavigationDrawer state={state} navigation={navigation} />
        </SafeAreaProvider>,
      );

      fireEvent.press(screen.getByText('Sign out'));
      expect(clearToken).toHaveBeenCalled();
      await waitFor(() =>
        expect(navigation.navigate).toHaveBeenCalledWith('Sign in'),
      );
    });
  });
});
