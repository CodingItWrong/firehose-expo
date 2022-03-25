import {fireEvent, render, waitFor} from '@testing-library/react-native';
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

  it('allows marking a link as read', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([bookmark]));

    const {getByLabelText, getByText} = render(
      <PaperProvider>
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>
      </PaperProvider>,
    );

    await waitFor(() => getByLabelText('Actions'));
    fireEvent.press(getByLabelText('Actions'));

    await waitFor(() => getByText('Mark Read'));
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

    // TODO: test that Mark Read is hidden
  });
});
