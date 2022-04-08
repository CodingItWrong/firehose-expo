import {render} from '@testing-library/react-native';
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
      source: 'My Source',
      comment: 'My Comment',
    },
  };

  const providers = children => (
    <TokenProvider skipLoading>{children}</TokenProvider>
  );

  it('allows editing fields on the bookmark', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse(bookmark));

    const route = {params: {id: bookmark.id}};

    const {findByLabelText, getByLabelText} = render(
      providers(<BookmarkDetailScreen route={route} />),
    );

    expect(http.get).toHaveBeenCalledWith(`bookmarks/${bookmark.id}?`);

    await findByLabelText('URL');
    expect(getByLabelText('URL')).toHaveProp('value', bookmark.attributes.url);
  });
});
