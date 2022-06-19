import '@testing-library/jest-native/extend-expect';
import {setLogger} from 'react-query';

// disable react-query logging in tests
setLogger({
  log: () => {},
  warn: () => {},
  error: () => {},
});
