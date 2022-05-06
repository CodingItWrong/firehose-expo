import {ResourceClient} from '@codingitwrong/jsonapi-client';
import {useMemo} from 'react';
import httpClient from './httpClient';
import {useToken} from './token';

export function useTags() {
  const {token} = useToken();

  const tagClient = useMemo(
    () => new ResourceClient({name: 'tags', httpClient: httpClient({token})}),
    [token],
  );

  return tagClient;
}
