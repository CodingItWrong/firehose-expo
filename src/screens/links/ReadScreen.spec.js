import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import nock from 'nock';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {
  jsonApiResponseBody,
  mockUseFocusEffect,
  safeAreaMetrics,
} from '../../testUtils';
import ReadScreen from './ReadScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useLinkTo: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('ReadScreen', () => {
  const meta = {'page-count': 7};
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
  const bookmark2 = {
    id: '2',
    attributes: {
      ...bookmark.attributes,
      title: 'Bookmark 2',
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
    mockUseFocusEffect();
  });

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta));

      const {findByText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      mockedServer.done();
    });

    it('allows searching', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta))
        .get('/api/bookmarks?filter[read]=true&filter[title]=2&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark2], meta));

      const {findByText, getByLabelText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      const searchField = getByLabelText('Search');
      fireEvent.changeText(searchField, '2');
      fireEvent(searchField, 'submitEditing');

      await findByText(bookmark2.attributes.title);

      mockedServer.done();
    });

    it('allows pagination', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta))
        .get('/api/bookmarks?filter[read]=true&page[number]=2')
        .reply(200, jsonApiResponseBody([bookmark2], meta))
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta));

      const {findByText, getByLabelText, queryByText} = render(
        providers(<ReadScreen />),
      );

      await findByText(bookmark.attributes.title);
      expect(queryByText('Page 1 of 7')).not.toBeNull();

      fireEvent.press(getByLabelText('Go to next page'));
      await findByText(bookmark2.attributes.title);

      fireEvent.press(getByLabelText('Go to previous page'));
      await findByText(bookmark.attributes.title);

      mockedServer.done();
    });
  });

  describe('adding a link', () => {
    it('does not allow adding a link to the list', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta));

      const {findByText, queryByLabelText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      expect(queryByLabelText('URL to Add')).toBeNull();
    });
  });

  describe('mark unread', () => {
    it('allows marking a link as unread', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=true&page[number]=1')
        .reply(200, jsonApiResponseBody([bookmark], meta))
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
        .reply(200, jsonApiResponseBody([bookmark], meta))
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
