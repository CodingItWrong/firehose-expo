import {useNavigation} from '@react-navigation/native';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import nock from 'nock';
import {Platform} from 'react-native';
import {jsonApiResponseBody, providers} from '../../testUtils';
import BookmarkDetailScreen from './BookmarkDetailScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('BookmarkDetailScreen', () => {
  const bookmark = {
    id: '42',
    attributes: {
      url: 'https://codingitwrong.com',
      title: 'My Title',
      'tag-list': 'one-tag another-tag',
      source: 'My Source',
      comment: 'My Comment',
    },
  };
  const newUrl = 'https://react-native.dev';
  const newTitle = 'New Title';
  const newSource = 'New Source';
  const newComment = 'New Comment';
  const newTagList = 'new-tag another-new-tag';

  beforeEach(() => {
    // fix error in KeyboardAwareHOC in tests
    Platform.constants.reactNativeVersion = {};
  });

  it('allows editing fields on the bookmark', async () => {
    const {
      url,
      title,
      source,
      comment,
      'tag-list': tagList,
    } = bookmark.attributes;

    const mockedServer = nock('http://localhost:3000')
      .get(`/api/bookmarks/${bookmark.id}?`)
      .reply(200, jsonApiResponseBody(bookmark))
      .patch(`/api/bookmarks/${bookmark.id}?`, {
        data: {
          type: 'bookmarks',
          id: '42',
          attributes: {
            url: newUrl,
            title: newTitle,
            'tag-list': newTagList,
            source: newSource,
            comment: newComment,
          },
        },
      })
      .reply(200);

    const navigation = {goBack: jest.fn()};
    useNavigation.mockReturnValue(navigation);

    const route = {params: {id: bookmark.id}};

    render(providers(<BookmarkDetailScreen route={route} />));

    // displays current values from server
    await screen.findByLabelText('URL');
    expect(screen.getByLabelText('URL')).toHaveProp('value', url);
    expect(screen.getByLabelText('Title')).toHaveProp('value', title);
    expect(screen.getByLabelText('Tags')).toHaveProp('value', tagList);
    expect(screen.getByLabelText('Source')).toHaveProp('value', source);
    expect(screen.getByLabelText('Comment')).toHaveProp('value', comment);

    // update values
    fireEvent.changeText(screen.getByLabelText('URL'), newUrl);
    fireEvent.changeText(screen.getByLabelText('Title'), newTitle);
    fireEvent.changeText(screen.getByLabelText('Tags'), newTagList);
    fireEvent.changeText(screen.getByLabelText('Source'), newSource);
    fireEvent.changeText(screen.getByLabelText('Comment'), newComment);
    fireEvent.press(screen.getByText('Save'));

    // confirm navigate back to parent screen
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledWith());

    // confirm data saved to server
    mockedServer.done();
  });

  it('does not save the bookmark upon cancelling', async () => {
    nock('http://localhost:3000')
      .get(`/api/bookmarks/${bookmark.id}?`)
      .reply(200, jsonApiResponseBody(bookmark));

    const navigation = {goBack: jest.fn()};
    useNavigation.mockReturnValue(navigation);

    const route = {params: {id: bookmark.id}};

    render(providers(<BookmarkDetailScreen route={route} />));

    await screen.findByLabelText('URL');
    fireEvent.changeText(screen.getByLabelText('URL'), newUrl);
    fireEvent.changeText(screen.getByLabelText('Title'), newTitle);
    fireEvent.changeText(screen.getByLabelText('Tags'), newTagList);
    fireEvent.changeText(screen.getByLabelText('Source'), newSource);
    fireEvent.changeText(screen.getByLabelText('Comment'), newComment);

    fireEvent.press(screen.getByText('Cancel'));

    // confirm navigate back to parent screen
    expect(navigation.goBack).toHaveBeenCalledWith();

    // data not saved to server, because patch not mocked
  });
});
