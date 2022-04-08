import {fireEvent, render} from '@testing-library/react-native';
import {TokenProvider} from '../../data/token';
import {jsonApiResponse, mockHttp} from '../../testUtils';
import BookmarkDetailScreen from './BookmarkDetailScreen';

jest.mock('../../data/httpClient');

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
    const newUrl = 'https://react-native.dev';
    const newTitle = 'New Title';
    const newSource = 'New Source';
    const newComment = 'New Comment';
    const newTagList = 'new-tag another-new-tag';

    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse(bookmark));

    const route = {params: {id: bookmark.id}};

    const {findByLabelText, getByLabelText} = render(
      providers(<BookmarkDetailScreen route={route} />),
    );

    expect(http.get).toHaveBeenCalledWith(`bookmarks/${bookmark.id}?`);

    await findByLabelText('URL');
    expect(getByLabelText('URL')).toHaveProp('value', url);
    expect(getByLabelText('Title')).toHaveProp('value', title);
    expect(getByLabelText('Tags')).toHaveProp('value', tagList);
    expect(getByLabelText('Source')).toHaveProp('value', source);
    expect(getByLabelText('Comment')).toHaveProp('value', comment);

    fireEvent.changeText(getByLabelText('URL'), newUrl);
    fireEvent.changeText(getByLabelText('Title'), newTitle);
    fireEvent.changeText(getByLabelText('Tags'), newTagList);
    fireEvent.changeText(getByLabelText('Source'), newSource);
    fireEvent.changeText(getByLabelText('Comment'), newComment);
  });
});
