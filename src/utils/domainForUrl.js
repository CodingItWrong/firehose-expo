import Url from 'url-parse';

export default function domainForUrl(urlString) {
  const url = new Url(urlString);
  let host = url.hostname;
  if (host.startsWith('www.')) {
    host = host.substr(4);
  }
  return host || null;
}
