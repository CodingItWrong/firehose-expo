import {render, waitFor} from '@testing-library/react-native';
import authenticatedHttpClient from '../../data/authenticatedHttpClient';
import {TokenProvider} from '../../data/token';
import UnreadScreen from './UnreadScreen';

jest.mock('../../data/authenticatedHttpClient');

describe('UnreadScreen', () => {
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://codingitwrong.com',
    },
  };

  it('renders links from the backend', async () => {
    const http = {
      get: jest.fn().mockResolvedValue({data: {data: [bookmark]}}),
    };
    authenticatedHttpClient.mockReturnValue(http);

    const {getByText} = render(
      <TokenProvider skipLoading>
        <UnreadScreen />
      </TokenProvider>,
    );

    expect(http.get).toHaveBeenCalledWith('bookmarks?filter[read]=false&');
    await waitFor(() => getByText(bookmark.attributes.title));
  });

  it.todo('opens a link in the browser when clicked');
});
