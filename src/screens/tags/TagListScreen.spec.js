import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {fireEvent, render} from '@testing-library/react-native';
import nock from 'nock';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {jsonApiResponseBody, safeAreaMetrics} from '../../testUtils';
import TagListScreen from './TagListScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('TagListScreen', () => {
  const tag = {id: '1', attributes: {name: 'hypercard'}};

  const providers = children => (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TokenProvider skipLoading>{children}</TokenProvider>
    </SafeAreaProvider>
  );

  beforeEach(() => {
    // provide mock implementation of useFocusEffect to run once each time callback changes
    let lastCallback = null;
    useFocusEffect.mockImplementation(callback => {
      if (lastCallback !== callback) {
        lastCallback = callback;
        callback();
      }
    });
  });

  describe('displaying tags', () => {
    it('renders tags from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/tags?')
        .reply(200, jsonApiResponseBody([tag]));

      const {findByText} = render(providers(<TagListScreen />));

      await findByText(tag.attributes.name);

      mockedServer.done();
    });

    it('shows an error message when loading tags fails', async () => {
      nock('http://localhost:3000').get('/api/tags?').reply(500);

      const {findByText, queryByLabelText} = render(
        providers(<TagListScreen />),
      );

      await findByText('An error occurred while loading tags.');
      expect(queryByLabelText('Loading')).toBeNull();
    });

    it('shows a message when there are no tags to display', async () => {
      nock('http://localhost:3000')
        .get('/api/tags?')
        .reply(200, jsonApiResponseBody([]));

      const {findByText} = render(providers(<TagListScreen />));

      await findByText('No tags.');
    });
  });

  describe('clicking a tag', () => {
    it('navigates to the tagged links screen for that tag', async () => {
      nock('http://localhost:3000')
        .get('/api/tags?')
        .reply(200, jsonApiResponseBody([tag]));

      const navigation = {navigate: jest.fn()};
      useNavigation.mockReturnValue(navigation);

      const {findByText, getByText} = render(providers(<TagListScreen />));

      const tagName = tag.attributes.name;
      await findByText(tagName);
      fireEvent.press(getByText(tagName));

      expect(navigation.navigate).toHaveBeenCalledWith('TaggedLinksScreen', {
        tag: tagName,
      });
    });
  });
});
