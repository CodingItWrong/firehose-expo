import {ResourceClient} from '@codingitwrong/jsonapi-client';
import {useMemo} from 'react';
import httpClient from './httpClient';
import {useToken} from './token';

export function useBookmarks() {
  const {token} = useToken();

  const bookmarkClient = useMemo(
    () =>
      new ResourceClient({name: 'bookmarks', httpClient: httpClient({token})}),
    [token],
  );

  return bookmarkClient;
}
