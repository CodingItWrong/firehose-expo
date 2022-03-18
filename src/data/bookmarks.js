import {ResourceClient} from '@codingitwrong/jsonapi-client';
import {useMemo} from 'react';
import authenticatedHttpClient from './authenticatedHttpClient';
import {useToken} from './token';

export function useBookmarks() {
  const {token} = useToken();

  const bookmarkClient = useMemo(() => {
    const httpClient = authenticatedHttpClient({token});
    return new ResourceClient({name: 'bookmarks', httpClient});
  }, [token]);

  return bookmarkClient;
}
