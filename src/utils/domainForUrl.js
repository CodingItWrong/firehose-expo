import Url from 'url-parse';

// const URL_REGEX = /^(\w+):\/\/([^/]*\.)?(\w+\.\w+)$/;

// export default function domainForUrl(urlString) {
//   const match = urlString.match(URL_REGEX);
//   console.log({match});
//   const [, _protocol, _subdomains, domain] = match;
//   return domain;
// }

export default function domainForUrl(urlString) {
  const url = new Url(urlString);
  let host = url.hostname;
  if (host.startsWith('www.')) {
    host = host.substr(4);
  }
  return host || null;
}
