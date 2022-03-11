import {createContext, useContext, useState} from 'react';

const TokenContext = createContext(null);

export function TokenProvider({children}) {
  const [token, setToken] = useState(null);

  return (
    <TokenContext.Provider value={{token, setToken}}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const {token, setToken} = useContext(TokenContext);

  function clearToken() {
    setToken(null);
  }

  const isLoggedIn = token !== null;

  return {token, isLoggedIn, setToken, clearToken};
}
