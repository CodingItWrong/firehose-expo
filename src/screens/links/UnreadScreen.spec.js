import {useLinkTo, useNavigation} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
import nock from 'nock';
import {
  jsonApiResponseBody,
  mockUseFocusEffect,
  providers,
} from '../../testUtils';
import UnreadScreen from './UnreadScreen';

jest.mock('expo-linking', () => ({openURL: jest.fn()}));
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useLinkTo: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('UnreadScreen', () => {
  const tagName = 'another-tag';
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://www.codingitwrong.com/books',
      comment: 'This is my book list',
      source: 'Nice Referrer',
      'tag-list': `tag ${tagName}`,
    },
  };

  beforeEach(() => {
    mockUseFocusEffect();
  });

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      render(providers(<UnreadScreen />));

      expect(screen.queryByLabelText('Loading')).not.toBeNull();
      await waitForElementToBeRemoved(() => screen.getByLabelText('Loading'));

      expect(screen.queryByText(bookmark.attributes.title)).not.toBeNull();
      expect(screen.queryByText(bookmark.attributes.comment)).not.toBeNull();
      expect(screen.queryByText('codingitwrong.com')).not.toBeNull();
      expect(
        screen.queryByText(`From ${bookmark.attributes.source}`),
      ).not.toBeNull();
      expect(screen.queryByText('tag')).not.toBeNull();
      expect(screen.queryByText('another-tag')).not.toBeNull();

      expect(screen.queryByLabelText('Loading')).toBeNull();

      mockedServer.done();
    });

    it('shows an error message when loading links fails', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(500);

      render(providers(<UnreadScreen />));

      await screen.findByText('An error occurred while loading links.');
      expect(screen.queryByLabelText('Loading')).toBeNull();
    });

    it('shows a message when there are no links to display', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      render(providers(<UnreadScreen />));

      await screen.findByText('No unread links.');
    });
  });

  describe('link clicking', () => {
    it('opens a link in the browser when clicking the title', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      render(providers(<UnreadScreen />));

      await screen.findByText(bookmark.attributes.title);

      fireEvent.press(screen.getByText(bookmark.attributes.title));

      expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
    });

    it('opens a link in the browser when clicking the bookmark url', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      render(providers(<UnreadScreen />));

      await screen.findByText(bookmark.attributes.title);

      fireEvent.press(screen.getByText('codingitwrong.com'));

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

      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmarkWithUrlSource]));

      render(providers(<UnreadScreen />));

      const sourceText = 'From mastodon.technology';
      await screen.findByText(sourceText);

      fireEvent.press(screen.getByText(sourceText));

      expect(Linking.openURL).toHaveBeenCalledWith(source);
    });
  });

  describe('clicking a tag', () => {
    it('navigates to the tagged links screen for that tag', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      const linkTo = jest.fn();
      useLinkTo.mockReturnValue(linkTo);

      render(providers(<UnreadScreen />));

      await screen.findByText(tagName);
      fireEvent.press(screen.getByText(tagName));

      expect(linkTo).toHaveBeenCalledWith(`/tags/${tagName}`);
    });
  });

  describe('refreshing', () => {
    describe('pulling on mobile', () => {
      it('refreshes the list', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([bookmark]));

        render(providers(<UnreadScreen />));

        await screen.findByText('No unread links.');

        fireEvent(screen.getByTestId('bookmarks-list'), 'refresh');
        expect(screen.getByTestId('bookmarks-list')).toHaveProp(
          'refreshing',
          true,
        );

        await screen.findByText(bookmark.attributes.title);
        expect(screen.getByTestId('bookmarks-list')).toHaveProp(
          'refreshing',
          false,
        );
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(500);

        render(providers(<UnreadScreen />));

        await screen.findByText('No unread links.');

        fireEvent(screen.getByTestId('bookmarks-list'), 'refresh');

        await screen.findByText('An error occurred while loading links.');
        expect(screen.getByTestId('bookmarks-list')).toHaveProp(
          'refreshing',
          false,
        );
      });
    });

    describe('clicking a button on web', () => {
      it('refreshes the list', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([bookmark]));

        render(providers(<UnreadScreen />));

        await screen.findByText('No unread links.');

        fireEvent.press(screen.getByText('Reload'));
        expect(screen.queryByLabelText('Loading')).not.toBeNull();

        await screen.findByText(bookmark.attributes.title);
        expect(screen.queryByLabelText('Loading')).toBeNull();
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(500);

        render(providers(<UnreadScreen />));

        await screen.findByText('No unread links.');

        fireEvent.press(screen.getByText('Reload'));

        await screen.findByText('An error occurred while loading links.');
        expect(screen.queryByLabelText('Loading')).toBeNull();
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
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .post('/api/bookmarks?', {
          data: {
            type: 'bookmarks',
            attributes: {url: newBookmark.attributes.url},
          },
        })
        .reply(200, {})
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark, newBookmark]));

      render(providers(<UnreadScreen />));

      const newField = screen.getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(screen.queryByLabelText('Adding URL')).not.toBeNull();

      await screen.findByText(newBookmark.attributes.title);
      expect(newField).toHaveProp('value', '');
      expect(screen.queryByLabelText('Adding URL')).toBeNull();

      mockedServer.done();
    });

    it('does not send a request to the server if the url is blank', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      render(providers(<UnreadScreen />));

      await screen.findByText(bookmark.attributes.title);

      const newField = screen.getByLabelText('URL to Add');
      fireEvent(newField, 'submitEditing');

      mockedServer.done();
    });

    it('shows an error message when adding link fails', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .post('/api/bookmarks?')
        .reply(500)
        .post('/api/bookmarks?')
        .reply(200, {})
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark, newBookmark]));

      render(providers(<UnreadScreen />));

      const newField = screen.getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(screen.queryByLabelText('Adding URL')).not.toBeNull();

      await screen.findByText('An error occurred while adding URL.');
      expect(newField).toHaveProp('value', newBookmark.attributes.url);
      expect(screen.queryByLabelText('Adding URL')).toBeNull();

      fireEvent(newField, 'submitEditing');

      expect(
        screen.queryByText('An error occurred while adding URL.'),
      ).toBeNull();

      await screen.findByText(newBookmark.attributes.title);

      mockedServer.done();
    });
  });

  describe('mark read', () => {
    it('allows marking a link as read', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .patch('/api/bookmarks/1?', {
          data: {
            type: 'bookmarks',
            id: '1',
            attributes: {read: true},
          },
        })
        .reply(200)
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      render(providers(<UnreadScreen />));

      await screen.findByText('Mark Read');
      fireEvent.press(screen.getByText('Mark Read'));

      await waitForElementToBeRemoved(() =>
        screen.getByText(bookmark.attributes.title),
      );

      mockedServer.done();
    });

    it('shows an error message when marking a link read fails', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .patch('/api/bookmarks/1?')
        .reply(500)
        .patch('/api/bookmarks/1?')
        .reply(200)
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      render(providers(<UnreadScreen />));

      await screen.findByText('Mark Read');
      fireEvent.press(screen.getByText('Mark Read'));

      await screen.findByText('An error occurred while marking link read.');

      // clear error
      fireEvent.press(screen.getByText('Mark Read'));

      expect(
        screen.queryByText('An error occurred while marking link read.'),
      ).toBeNull();
      await waitForElementToBeRemoved(() =>
        screen.getByText(bookmark.attributes.title),
      );
    });
  });

  describe('edit', () => {
    it('navigates to the bookmark detail screen', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      const navigation = {navigate: jest.fn()};
      useNavigation.mockReturnValue(navigation);

      render(providers(<UnreadScreen />));

      await screen.findByText('Edit');
      fireEvent.press(screen.getByText('Edit'));

      expect(navigation.navigate).toHaveBeenCalledWith('BookmarkDetailScreen', {
        id: bookmark.id,
      });
    });
  });

  describe('delete', () => {
    it('allows deleting a link', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .delete('/api/bookmarks/1?')
        .reply(200)
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      render(providers(<UnreadScreen />));

      fireEvent.press(await screen.findByText('Delete'));

      await waitForElementToBeRemoved(() =>
        screen.getByText(bookmark.attributes.title),
      );

      mockedServer.done();
    });

    it('shows an error message when deleting a link fails', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .delete('/api/bookmarks/1?')
        .reply(500)
        .delete('/api/bookmarks/1?')
        .reply(200)
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      render(providers(<UnreadScreen />));

      await screen.findByText('Delete');
      fireEvent.press(screen.getByText('Delete'));

      await screen.findByText('An error occurred while deleting link.');

      // clear error
      await screen.findByText('Delete');
      fireEvent.press(screen.getByText('Delete'));

      expect(
        screen.queryByText('An error occurred while deleting link.'),
      ).toBeNull();
      await waitForElementToBeRemoved(() =>
        screen.getByText(bookmark.attributes.title),
      );
    });
  });
});
