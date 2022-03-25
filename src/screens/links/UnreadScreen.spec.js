import {fireEvent, render, waitFor} from '@testing-library/react-native';
import * as Linking from 'expo-linking';
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

  it('renders links from the backend', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([bookmark]));

    const {getByText} = render(
      <TokenProvider skipLoading>
        <UnreadScreen />
      </TokenProvider>,
    );

    expect(http.get).toHaveBeenCalledWith('bookmarks?filter[read]=false&');
    await waitFor(() => getByText(bookmark.attributes.title));
  });

  it('opens a link in the browser when clicked', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([bookmark]));

    const {getByText} = render(
      <TokenProvider skipLoading>
        <UnreadScreen />
      </TokenProvider>,
    );

    await waitFor(() => getByText(bookmark.attributes.title));

    fireEvent.press(getByText(bookmark.attributes.title));

    expect(Linking.openURL).toHaveBeenCalledWith(bookmark.attributes.url);
  });
});
