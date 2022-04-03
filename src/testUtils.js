/* eslint-disable no-undef */

import httpClient from './data/httpClient';

export function mockHttp() {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  httpClient.mockReturnValue(http);
  return http;
}

export function jsonApiResponse(records) {
  return {data: {data: records}};
}
