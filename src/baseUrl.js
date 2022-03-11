import {Platform} from 'react-native';

function getBaseUrl() {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else {
    return 'http://localhost:3000';
  }
}

const baseUrl = getBaseUrl();

export default baseUrl;
