const URL_REGEX = /^\w+:\/\/([^/]+\.\w+)/;

export default function domainForUrl(urlString) {
  const match = urlString.match(URL_REGEX);
  if (match) {
    let [, host] = match;
    if (host.startsWith('www.')) {
      host = host.substr(4);
    }
    return host;
  } else {
    return null;
  }
}
