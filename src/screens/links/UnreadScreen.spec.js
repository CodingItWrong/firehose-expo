import {useLinkTo, useNavigation} from '@react-navigation/native';
import {
  fireEvent,
  render,
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

      const {getByLabelText, queryByLabelText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      expect(queryByLabelText('Loading')).not.toBeNull();
      await waitForElementToBeRemoved(() => getByLabelText('Loading'));

      expect(queryByText(bookmark.attributes.title)).not.toBeNull();
      expect(queryByText(bookmark.attributes.comment)).not.toBeNull();
      expect(queryByText('codingitwrong.com')).not.toBeNull();
      expect(queryByText(`From ${bookmark.attributes.source}`)).not.toBeNull();
      expect(queryByText('tag')).not.toBeNull();
      expect(queryByText('another-tag')).not.toBeNull();

      expect(queryByLabelText('Loading')).toBeNull();

      mockedServer.done();
    });

    it('shows an error message when loading links fails', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(500);

      const {findByText, queryByLabelText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('An error occurred while loading links.');
      expect(queryByLabelText('Loading')).toBeNull();
    });

    it('shows a message when there are no links to display', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      const {findByText} = render(providers(<UnreadScreen />));

      await findByText('No unread links.');
    });
  });

  describe('link clicking', () => {
    it('opens a link in the browser when clicking the title', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText(bookmark.attributes.title);

      fireEvent.press(getByText(bookmark.attributes.title));

      expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
    });

    it('opens a link in the browser when clicking the bookmark url', async () => {
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

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

      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmarkWithUrlSource]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      const sourceText = 'From mastodon.technology';
      await findByText(sourceText);

      fireEvent.press(getByText(sourceText));

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

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText(tagName);
      fireEvent.press(getByText(tagName));

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

        const {findByText, getByTestId} = render(providers(<UnreadScreen />));

        await findByText('No unread links.');

        fireEvent(getByTestId('bookmarks-list'), 'refresh');
        expect(getByTestId('bookmarks-list')).toHaveProp('refreshing', true);

        await findByText(bookmark.attributes.title);
        expect(getByTestId('bookmarks-list')).toHaveProp('refreshing', false);
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(500);

        const {findByText, getByTestId} = render(providers(<UnreadScreen />));

        await findByText('No unread links.');

        fireEvent(getByTestId('bookmarks-list'), 'refresh');

        await findByText('An error occurred while loading links.');
        expect(getByTestId('bookmarks-list')).toHaveProp('refreshing', false);
      });
    });

    describe('clicking a button on web', () => {
      it('refreshes the list', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([bookmark]));

        const {findByText, getByText, queryByLabelText} = render(
          providers(<UnreadScreen />),
        );

        await findByText('No unread links.');

        fireEvent.press(getByText('Reload'));
        expect(queryByLabelText('Loading')).not.toBeNull();

        await findByText(bookmark.attributes.title);
        expect(queryByLabelText('Loading')).toBeNull();
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/bookmarks?filter[read]=false&')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/bookmarks?filter[read]=false&')
          .reply(500);

        const {findByText, getByText, queryByLabelText} = render(
          providers(<UnreadScreen />),
        );

        await findByText('No unread links.');

        fireEvent.press(getByText('Reload'));

        await findByText('An error occurred while loading links.');
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

      const {findByText, getByLabelText, queryByLabelText} = render(
        providers(<UnreadScreen />),
      );

      const newField = getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(queryByLabelText('Adding URL')).not.toBeNull();

      await findByText(newBookmark.attributes.title);
      expect(newField).toHaveProp('value', '');
      expect(queryByLabelText('Adding URL')).toBeNull();

      mockedServer.done();
    });

    it('does not send a request to the server if the url is blank', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

      const {getByLabelText, findByText} = render(providers(<UnreadScreen />));

      await findByText(bookmark.attributes.title);

      const newField = getByLabelText('URL to Add');
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

      const {findByText, getByLabelText, queryByLabelText, queryByText} =
        render(providers(<UnreadScreen />));

      const newField = getByLabelText('URL to Add');
      fireEvent.changeText(newField, newBookmark.attributes.url);
      fireEvent(newField, 'submitEditing');
      expect(queryByLabelText('Adding URL')).not.toBeNull();

      await findByText('An error occurred while adding URL.');
      expect(newField).toHaveProp('value', newBookmark.attributes.url);
      expect(queryByLabelText('Adding URL')).toBeNull();

      fireEvent(newField, 'submitEditing');

      expect(queryByText('An error occurred while adding URL.')).toBeNull();

      await findByText(newBookmark.attributes.title);

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

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
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

      const {findByText, getByText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('Mark Read');
      fireEvent.press(getByText('Mark Read'));

      await findByText('An error occurred while marking link read.');

      // clear error
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
      nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]));

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
      const mockedServer = nock('http://localhost:3000')
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([bookmark]))
        .delete('/api/bookmarks/1?')
        .reply(200)
        .get('/api/bookmarks?filter[read]=false&')
        .reply(200, jsonApiResponseBody([]));

      const {findByText, getByText} = render(providers(<UnreadScreen />));

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
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

      const {findByText, getByText, queryByText} = render(
        providers(<UnreadScreen />),
      );

      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      await findByText('An error occurred while deleting link.');

      // clear error
      await findByText('Delete');
      fireEvent.press(getByText('Delete'));

      expect(queryByText('An error occurred while deleting link.')).toBeNull();
      await waitForElementToBeRemoved(() =>
        getByText(bookmark.attributes.title),
      );
    });
  });
});
