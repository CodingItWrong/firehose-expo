import {Platform} from 'react-native';

function getBaseUrl() {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api';
    } else {
      return 'http://localhost:3000/api';
    }
  } else {
    // TODO: add custom domain before sending to App Store in case I switch off Heroku
    return 'https://firehose-api.herokuapp.com/api';
  }
}

const baseUrl = getBaseUrl();

export default baseUrl;
