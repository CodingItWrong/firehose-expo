import {Platform} from 'react-native';

const LOCAL_IP = null;
// ifconfig | grep "inet "
// const LOCAL_IP = '10.0.1.52';

function getBaseUrl() {
  if (LOCAL_IP) {
    return `http://${LOCAL_IP}:3000/api`;
  }

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
