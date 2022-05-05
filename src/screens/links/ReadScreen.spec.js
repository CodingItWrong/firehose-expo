import {useFocusEffect} from '@react-navigation/native';
import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import nock from 'nock';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {jsonApiResponseBody, safeAreaMetrics} from '../../testUtils';
import ReadScreen from './ReadScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('ReadScreen', () => {
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://www.codingitwrong.com/books',
      comment: 'This is my book list',
      source: 'Nice Referrer',
      'tag-list': 'tag another-tag',
      read: true,
    },
  };

  const providers = children => (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <PaperProvider>
        <TokenProvider skipLoading>{children}</TokenProvider>
      </PaperProvider>
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

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark]));

      const {findByText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      mockedServer.done();
    });
  });

  describe('adding a link', () => {
    it('does not allow adding a link to the list', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark]));

      const {findByText, queryByLabelText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      expect(queryByLabelText('URL to Add')).toBeNull();
    });
  });

  describe('mark unread', () => {
    it('allows marking a link as unread', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark]))
        .patch('/api/bookmarks/1?', {
          data: {
            type: 'bookmarks',
            id: '1',
            attributes: {read: false},
          },
        })
        .reply(200);

      const {findByText, getByText} = render(providers(<ReadScreen />));

      await findByText('Mark Unread');
      fireEvent.press(getByText('Mark Unread'));

      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });

    it('shows an error message when marking a link read fails', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark]))
        .patch('/api/bookmarks/1?')
        .reply(500)
        .patch('/api/bookmarks/1?')
        .reply(200);

      const {findByText, getByText, queryByText} = render(
        providers(<ReadScreen />),
      );

      await findByText('Mark Unread');
      fireEvent.press(getByText('Mark Unread'));

      await findByText('An error occurred while marking link unread.');

      // clear error
      fireEvent.press(getByText('Mark Unread'));

      expect(
        queryByText('An error occurred while marking link unread.'),
      ).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });
});
