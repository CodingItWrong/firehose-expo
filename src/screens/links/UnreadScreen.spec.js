import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {jsonApiResponse, mockHttp} from '../../testUtils';
import UnreadScreen from './UnreadScreen';

jest.mock('../../data/httpClient');
jest.mock('expo-linking', () => ({openURL: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

const safeAreaMetrics = {
  frame: {
    width: 320,
    height: 640,
    x: 0,
    y: 0,
  },
  insets: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
};

describe('UnreadScreen', () => {
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://www.codingitwrong.com/books',
      comment: 'This is my book list',
      source: 'Nice Referrer',
      'tag-list': 'tag another-tag',
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
    // provide mock implementation of useFocusEffect to run only once
    let effectRun = false;
    useFocusEffect.mockImplementation(func => {
      if (!effectRun) {
        effectRun = true;
        func();
      }
    });
  });

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText, queryByLabelText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      expect(queryByLabelText('Loading')).not.toBeNull();
      expect(http.get).toHaveBeenCalledWith('bookmarks?filter[read]=false&');
      await findByText(bookmark.attributes.title);
      expect(queryByText(bookmark.attributes.comment)).not.toBeNull();
      expect(queryByText('codingitwrong.com')).not.toBeNull();
      expect(queryByText(`From ${bookmark.attributes.source}`)).not.toBeNull();
      expect(queryByText('tag')).not.toBeNull();
      expect(queryByText('another-tag')).not.toBeNull();

      expect(queryByLabelText('Loading')).toBeNull();
    });

    it('shows an error message when loading links fails', async () => {
      const http = mockHttp();
      http.get.mockRejectedValue();

      const {findByText, queryByLabelText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('An error occurred while loading links.');
      expect(queryByLabelText('Loading')).toBeNull();
    });

    it('shows a message when there are no links to display', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([]));

      const {findByText} = render(providers(<UnreadScreen />));

      await findByText('No unread links.');
    });
  });

  describe('link clicking', () => {
    it('opens a link in the browser when clicking the title', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText(bookmark.attributes.title);

      fireEvent.press(getByText(bookmark.attributes.title));

      expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
    });

    it('opens a link in the browser when clicking the bookmark url', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText(bookmark.attributes.title);

      fireEvent.press(getByText('codingitwrong.com'));

      expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
    });

    it('opens a link in the browser when clicking a source url', async () => {
      const source = 'https://mastodon.technology/@codingitwrong/123';
      const bookmarkWithUrlSource = {
        ...bookmark,
        attributes: {
          ...bookmark.attributes,
          source,
        },
      };

      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmarkWithUrlSource]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      const sourceText = 'From mastodon.technology';
      await findByText(sourceText);

      fireEvent.press(getByText(sourceText));

      expect(Linking.openURL).toHaveBeenCalledWith(source);
    });
  });

  describe('refreshing', () => {
    describe('pulling on mobile', () => {
      it('refreshes the list', async () => {
        const http = mockHttp();
        http.get.mockResolvedValue(jsonApiResponse([]));

        const {findByText, getByTestId} = render(providers(<UnreadScreen />));

        await findByText('No unread links.');

        http.get.mockResolvedValue(jsonApiResponse([bookmark]));
        fireEvent(getByTestId('unread-bookmarks-list'), 'refresh');
        expect(getByTestId('unread-bookmarks-list')).toHaveProp(
          'refreshing',
          true,
        );

        await findByText(bookmark.attributes.title);
        expect(getByTestId('unread-bookmarks-list')).toHaveProp(
          'refreshing',
          false,
        );
      });

      it('shows an error upon reload failure', async () => {
        const http = mockHttp();
        http.get.mockResolvedValue(jsonApiResponse([]));

        const {findByText, getByTestId} = render(providers(<UnreadScreen />));

        await findByText('No unread links.');

        http.get.mockRejectedValue();
        fireEvent(getByTestId('unread-bookmarks-list'), 'refresh');

        await findByText('An error occurred while loading links.');
        expect(getByTestId('unread-bookmarks-list')).toHaveProp(
          'refreshing',
          false,
        );
      });
    });

    describe.only('clicking a button on web', () => {
      it('refreshes the list', async () => {
        const http = mockHttp();
        http.get.mockResolvedValue(jsonApiResponse([]));

        const {findByText, getByText, queryByLabelText} = render(
          providers(<UnreadScreen />),
        );

        await findByText('No unread links.');

        http.get.mockResolvedValue(jsonApiResponse([bookmark]));
        fireEvent.press(getByText('Reload'));
        expect(queryByLabelText('Loading')).not.toBeNull();

        await findByText(bookmark.attributes.title);
        expect(queryByLabelText('Loading')).toBeNull();
      });
    });
  });

  describe('adding a link', () => {
    const newBookmark = {
      id: '2',
      attributes: {
        title: 'New Bookmark',
        url: 'https://reactnative.dev',
      },
    };

    it('allows adding a link to the list', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.post.mockResolvedValue(jsonApiResponse(newBookmark));

      const {findByText, getByLabelText, queryByLabelText} = render(
        providers(<UnreadScreen />),
      );

      const newField = getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(queryByLabelText('Adding URL')).not.toBeNull();

      expect(http.post).toHaveBeenCalledWith(
        'bookmarks?',
        {
          data: {
            type: 'bookmarks',
            attributes: {url: newBookmark.attributes.url},
          },
        },
        {headers: {'Content-Type': 'application/vnd.api+json'}},
      );

      await findByText(newBookmark.attributes.title);
      expect(newField).toHaveProp('value', '');
      expect(queryByLabelText('Adding URL')).toBeNull();
    });

    it('does not send a request to the server if the url is blank', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {getByLabelText, findByText} = render(providers(<UnreadScreen />));

      await findByText(bookmark.attributes.title);

      const newField = getByLabelText('URL to Add');
      fireEvent(newField, 'submitEditing');

      expect(http.post).not.toHaveBeenCalled();
    });

    it('shows an error message when adding link fails', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.post.mockRejectedValue();

      const {findByText, getByLabelText, queryByLabelText, queryByText} =
        render(providers(<UnreadScreen />));

      const newField = getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(queryByLabelText('Adding URL')).not.toBeNull();

      await findByText('An error occurred while adding URL.');
      expect(newField).toHaveProp('value', newBookmark.attributes.url);
      expect(queryByLabelText('Adding URL')).toBeNull();

      // clear error
      http.post.mockResolvedValue(jsonApiResponse(newBookmark));

      fireEvent(newField, 'submitEditing');

      expect(queryByText('An error occurred while adding URL.')).toBeNull();

      await findByText(newBookmark.attributes.title);
    });
  });

  describe('mark read', () => {
    it('allows marking a link as read', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.patch.mockResolvedValue(jsonApiResponse());

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      expect(http.patch).toHaveBeenCalledWith(
        'bookmarks/1?',
        {
          data: {
            type: 'bookmarks',
            id: '1',
            attributes: {read: true},
          },
        },
        {headers: {'Content-Type': 'application/vnd.api+json'}},
      );

      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });

    it('shows an error message when marking a link read fails', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.patch.mockRejectedValue();

      const {findByText, getByText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      await findByText('An error occurred while marking link read.');

      // clear error
      http.patch.mockResolvedValue(jsonApiResponse());

      fireEvent.press(getByText('Mark Read'));

      expect(
        queryByText('An error occurred while marking link read.'),
      ).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });

  describe('edit', () => {
    it('navigates to the bookmark detail screen', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const navigation = {navigate: jest.fn()};
      useNavigation.mockReturnValue(navigation);

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText('Edit');
      fireEvent.press(getByText('Edit'));

      expect(navigation.navigate).toHaveBeenCalledWith('BookmarkDetailScreen', {
        id: bookmark.id,
      });
    });
  });

  describe('delete', () => {
    it('allows deleting a link', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.delete.mockResolvedValue(jsonApiResponse());

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      expect(http.delete).toHaveBeenCalledWith('bookmarks/1');

      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });

    it('shows an error message when deleting a link fails', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.delete.mockRejectedValue();

      const {findByText, getByText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      await findByText('An error occurred while deleting link.');

      // clear error
      http.delete.mockResolvedValue(jsonApiResponse());

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      expect(queryByText('An error occurred while deleting link.')).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });
});
