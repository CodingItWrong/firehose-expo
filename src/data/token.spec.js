import {fireEvent, render, screen} from '@testing-library/react-native';
import {Button, Text} from 'react-native';
import {deleteStringAsync, getStringAsync, setStringAsync} from '../storage';
import {TokenProvider, useToken} from './token';

jest.mock('../storage');

describe('token', () => {
  const asyncStorageKey = 'FIREHOSE_ACCESS_TOKEN';
  const fakeToken = 'fake_token';

  function TestComponent() {
    const {token, isTokenLoaded, isLoggedIn, setToken, clearToken} = useToken();

    return (
      <>
        <Text>token: {token === null ? 'null' : token}</Text>
        <Text>isTokenLoaded: {isTokenLoaded ? 'true' : 'false'}</Text>
        <Text>isLoggedIn: {isLoggedIn ? 'true' : 'false'}</Text>
        <Button title="setToken" onPress={() => setToken(fakeToken)} />
        <Button title="clearToken" onPress={clearToken} />
      </>
    );
  }

  describe('initially', () => {
    function setUp() {
      const neverSettles = new Promise(() => {});
      getStringAsync.mockReturnValue(neverSettles);

      return render(
        <TokenProvider>
          <TestComponent />
        </TokenProvider>,
      );
    }

    it('loads the token from the correct async storage key', () => {
      setUp();
      expect(getStringAsync).toHaveBeenCalledWith(asyncStorageKey);
    });

    it('indicates the token is not loaded', () => {
      const {queryByText} = setUp();
      expect(queryByText('isTokenLoaded: false')).not.toBeNull();
    });

    it('returns null for the token', () => {
      const {queryByText} = setUp();
      expect(queryByText('token: null')).not.toBeNull();
    });

    it('indicates the user is not logged in', async () => {
      const {findByText} = setUp();
      await findByText('isLoggedIn: false');
    });
  });

  describe('when storage successfully returns a token', () => {
    function setUp() {
      getStringAsync.mockResolvedValue(fakeToken);

      return render(
        <TokenProvider>
          <TestComponent />
        </TokenProvider>,
      );
    }

    it('returns the token', async () => {
      const {findByText} = setUp();
      await findByText(`token: ${fakeToken}`);
    });

    it('indicates the token is loaded', async () => {
      const {findByText} = setUp();
      await findByText('isTokenLoaded: true');
    });

    it('indicates the user is logged in', async () => {
      const {findByText} = setUp();
      await findByText('isLoggedIn: true');
    });
  });

  describe('when storage successfully returns no token', () => {
    function setUp() {
      getStringAsync.mockResolvedValue(null);

      return render(
        <TokenProvider>
          <TestComponent />
        </TokenProvider>,
      );
    }

    it('indicates the token is loaded', async () => {
      const {findByText} = setUp();
      await findByText('isTokenLoaded: true');
    });

    it('returns no token', async () => {
      const {findByText} = setUp();
      await findByText('token: null');
    });

    it('indicates the user is not logged in', async () => {
      const {findByText} = setUp();
      await findByText('isLoggedIn: false');
    });
  });

  describe('setToken', () => {
    function setUp() {
      setStringAsync.mockResolvedValue();

      render(
        <TokenProvider skipLoading>
          <TestComponent />
        </TokenProvider>,
      );
      fireEvent.press(screen.getByText('setToken'));
    }

    it('persists the token to state and storage', async () => {
      setUp();

      expect(setStringAsync).toHaveBeenCalledWith(asyncStorageKey, fakeToken);

      await screen.findByText(`token: ${fakeToken}`);
      screen.getByText('isLoggedIn: true');
    });
  });

  describe('clearToken', () => {
    function setUp() {
      deleteStringAsync.mockResolvedValue();

      render(
        <TokenProvider skipLoading initialToken={fakeToken}>
          <TestComponent />
        </TokenProvider>,
      );
      fireEvent.press(screen.getByText('clearToken'));
    }

    it('clears the token from state and storage', async () => {
      setUp();

      expect(deleteStringAsync).toHaveBeenCalledWith(asyncStorageKey);

      await screen.findByText('token: null');
      screen.getByText('isLoggedIn: false');
    });
  });
});
