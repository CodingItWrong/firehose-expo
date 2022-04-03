import domainForUrl from './domainForUrl';

describe('domainForUrl', () => {
  it('returns the domain for a simple url', () => {
    expect(domainForUrl('https://google.com')).toEqual('google.com');
  });

  it('returns the domain without www for a www url', () => {
    expect(domainForUrl('https://www.google.com')).toEqual('google.com');
  });

  it('returns the full domain for a url with subdomain', () => {
    expect(domainForUrl('https://calendar.google.com')).toEqual(
      'calendar.google.com',
    );
  });

  it('returns the domain for a url with path', () => {
    expect(domainForUrl('https://apple.com/iphone')).toEqual('apple.com');
  });

  it('returns null for a string that is not a url', () => {
    expect(domainForUrl('Fred Flintstone')).toBeNull();
  });
});
