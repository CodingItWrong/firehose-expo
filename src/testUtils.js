/* eslint-disable no-undef */

import authenticatedHttpClient from './data/authenticatedHttpClient';

export function mockHttp() {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  authenticatedHttpClient.mockReturnValue(http);
  return http;
}

export function jsonApiResponse(records) {
  return {data: {data: records}};
}
