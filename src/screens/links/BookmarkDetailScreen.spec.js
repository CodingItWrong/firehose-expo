import {useNavigation} from '@react-navigation/native';
import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {TokenProvider} from '../../data/token';
import {jsonApiResponse, mockHttp} from '../../testUtils';
import BookmarkDetailScreen from './BookmarkDetailScreen';

jest.mock('../../data/httpClient');
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

  const providers = children => (
    <TokenProvider skipLoading>{children}</TokenProvider>
  );

  it('allows editing fields on the bookmark', async () => {
    const {
      url,
      title,
      source,
      comment,
      'tag-list': tagList,
    } = bookmark.attributes;

    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse(bookmark));
    http.patch.mockResolvedValue(jsonApiResponse());

    const navigation = {goBack: jest.fn()};
    useNavigation.mockReturnValue(navigation);

    const route = {params: {id: bookmark.id}};

    const {findByLabelText, getByLabelText, getByText} = render(
      providers(<BookmarkDetailScreen route={route} />),
    );

    expect(http.get).toHaveBeenCalledWith(`bookmarks/${bookmark.id}?`);

    // displays current values from server
    await findByLabelText('URL');
    expect(getByLabelText('URL')).toHaveProp('value', url);
    expect(getByLabelText('Title')).toHaveProp('value', title);
    expect(getByLabelText('Tags')).toHaveProp('value', tagList);
    expect(getByLabelText('Source')).toHaveProp('value', source);
    expect(getByLabelText('Comment')).toHaveProp('value', comment);

    // update values
    fireEvent.changeText(getByLabelText('URL'), newUrl);
    fireEvent.changeText(getByLabelText('Title'), newTitle);
    fireEvent.changeText(getByLabelText('Tags'), newTagList);
    fireEvent.changeText(getByLabelText('Source'), newSource);
    fireEvent.changeText(getByLabelText('Comment'), newComment);
    fireEvent.press(getByText('Save'));

    // confirm data saved to server
    expect(http.patch).toHaveBeenCalledWith(
      `bookmarks/${bookmark.id}?`,
      {
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
      },
      {headers: {'Content-Type': 'application/vnd.api+json'}},
    );

    // confirm navigate back to parent screen
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledWith());
  });

  it('does not save the bookmark upon cancelling', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse(bookmark));
    http.patch.mockResolvedValue(jsonApiResponse());

    const navigation = {goBack: jest.fn()};
    useNavigation.mockReturnValue(navigation);

    const route = {params: {id: bookmark.id}};

    const {findByLabelText, getByLabelText, getByText} = render(
      providers(<BookmarkDetailScreen route={route} />),
    );

    await findByLabelText('URL');
    fireEvent.changeText(getByLabelText('URL'), newUrl);
    fireEvent.changeText(getByLabelText('Title'), newTitle);
    fireEvent.changeText(getByLabelText('Tags'), newTagList);
    fireEvent.changeText(getByLabelText('Source'), newSource);
    fireEvent.changeText(getByLabelText('Comment'), newComment);

    fireEvent.press(getByText('Cancel'));

    // confirm navigate back to parent screen
    expect(navigation.goBack).toHaveBeenCalledWith();

    // confirm data saved to server
    expect(http.patch).not.toHaveBeenCalled();
  });
});
