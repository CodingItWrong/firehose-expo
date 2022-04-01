import {
  fireEvent,
  render,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import {Provider as PaperProvider} from 'react-native-paper';
import {TokenProvider} from '../../data/token';
import {jsonApiResponse, mockHttp} from '../../testUtils';
import UnreadScreen from './UnreadScreen';

jest.mock('../../data/authenticatedHttpClient');
jest.mock('expo-linking', () => ({openURL: jest.fn()}));

describe('UnreadScreen', () => {
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://codingitwrong.com',
    },
  };

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText} = render(
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>,
      );

      expect(http.get).toHaveBeenCalledWith('bookmarks?filter[read]=false&');
      await findByText(bookmark.attributes.title);
    });

    it('shows an error message when loading links fails', async () => {
      const http = mockHttp();
      http.get.mockRejectedValue();

      const {findByText} = render(
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>,
      );

      await findByText('An error occurred while loading links.');
    });

    it('shows a message when there are no links to display', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([]));

      const {findByText} = render(
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>,
      );

      await findByText('No unread links.');
    });
  });

  describe('link clicking', () => {
    it('opens a link in the browser when clicked', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText, getByText} = render(
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>,
      );

      await findByText(bookmark.attributes.title);

      fireEvent.press(getByText(bookmark.attributes.title));

      expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
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
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
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

      const {getByLabelText, findByText} = render(
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
      );

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
        render(
          <PaperProvider>
            <TokenProvider skipLoading>
              <UnreadScreen />
            </TokenProvider>
          </PaperProvider>,
        );

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

      const {
        findByLabelText,
        findByText,
        getByLabelText,
        getByText,
        queryByText,
      } = render(
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
      );

      await findByLabelText('Actions');
      fireEvent.press(getByLabelText('Actions'));

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

      await waitForElementToBeRemoved(() => getByText('Mark Read'));
      // TODO: fix warning with Mark Read disappearing
      expect(queryByText(bookmark.attributes.title)).toBeNull();
    });

    it('shows an error message when marking a link read fails', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.patch.mockRejectedValue();

      const {
        findByLabelText,
        findByText,
        getByLabelText,
        getByText,
        queryByText,
      } = render(
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
      );

      await findByLabelText('Actions');
      fireEvent.press(getByLabelText('Actions'));
      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      await findByText('An error occurred while marking link read.');

      // clear error
      http.patch.mockResolvedValue(jsonApiResponse());

      fireEvent.press(getByLabelText('Actions'));
      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      expect(
        queryByText('An error occurred while marking link read.'),
      ).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });

  describe('delete', () => {
    it('allows deleting a link', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.delete.mockResolvedValue(jsonApiResponse());

      const {
        findByLabelText,
        findByText,
        getByLabelText,
        getByText,
        queryByText,
      } = render(
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
      );

      await findByLabelText('Actions');
      fireEvent.press(getByLabelText('Actions'));

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      expect(http.delete).toHaveBeenCalledWith('bookmarks/1');

      await waitForElementToBeRemoved(() => getByText('Delete'));
      // TODO: fix warning with Menu disappearing
      expect(queryByText(bookmark.attributes.title)).toBeNull();
    });

    it('shows an error message when deleting a link fails', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));
      http.delete.mockRejectedValue();

      const {
        findByLabelText,
        findByText,
        getByLabelText,
        getByText,
        queryByText,
      } = render(
        <PaperProvider>
          <TokenProvider skipLoading>
            <UnreadScreen />
          </TokenProvider>
        </PaperProvider>,
      );

      await findByLabelText('Actions');
      fireEvent.press(getByLabelText('Actions'));
      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      await findByText('An error occurred while deleting link.');

      // clear error
      http.delete.mockResolvedValue(jsonApiResponse());

      fireEvent.press(getByLabelText('Actions'));
      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      expect(queryByText('An error occurred while deleting link.')).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });
});
