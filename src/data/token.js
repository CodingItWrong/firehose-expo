import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {deleteStringAsync, getStringAsync, setStringAsync} from '../storage';

const ACCESS_TOKEN_KEY = 'FIREHOSE_ACCESS_TOKEN';

const TokenContext = createContext(null);

export function TokenProvider({children}) {
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const [token, setToken] = useState(null);

  return (
    <TokenContext.Provider
      value={{token, setToken, isTokenLoaded, setIsTokenLoaded}}
    >
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const {
    token,
    setToken: setTokenInternal,
    isTokenLoaded,
    setIsTokenLoaded,
  } = useContext(TokenContext);

  useEffect(() => {
    if (!isTokenLoaded) {
      getStringAsync(ACCESS_TOKEN_KEY).then(newToken => {
        if (newToken) {
          setTokenInternal(newToken);
        }
        setIsTokenLoaded(true);
      });
    }
  }, [isTokenLoaded, setTokenInternal, setIsTokenLoaded]);

  const setToken = useCallback(
    async function (newToken) {
      await setStringAsync(ACCESS_TOKEN_KEY, newToken);
      setTokenInternal(newToken);
    },
    [setTokenInternal],
  );

  async function clearToken() {
    await deleteStringAsync(ACCESS_TOKEN_KEY);
    setTokenInternal(null);
  }

  const isLoggedIn = token !== null;

  return {token, isLoggedIn, setToken, clearToken};
}
