/* eslint-disable no-undef */

import httpClient from './data/httpClient';

// To use this function, call the following at the top level of your test:
//
// jest.mock('path/to/data/httpClient');
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
  return {data: jsonApiResponseBody(records)};
}

export function jsonApiResponseBody(records) {
  return {data: records};
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
