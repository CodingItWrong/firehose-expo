import {
  fireEvent,
  render,
  waitFor,
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

  it('shows an error message when loading links fails', async () => {
    const http = mockHttp();
    http.get.mockRejectedValue();

    const {getByText} = render(
      <TokenProvider skipLoading>
        <UnreadScreen />
      </TokenProvider>,
    );

    await waitFor(() => getByText('An error occurred while loading links.'));
  });

  it('shows a message when there are no links to display', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([]));

    const {getByText} = render(
      <TokenProvider skipLoading>
        <UnreadScreen />
      </TokenProvider>,
    );

    await waitFor(() => getByText('No unread links.'));
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
    http.patch.mockResolvedValue(jsonApiResponse());

    const {getByLabelText, getByText, queryByText} = render(
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

    await waitForElementToBeRemoved(() => getByText('Mark Read'));
    // TODO: fix warning with Mark Read disappearing
    expect(queryByText(bookmark.attributes.title)).toBeNull();
  });

  it('shows an error message when marking a link read fails', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([bookmark]));
    http.patch.mockRejectedValue();

    const {getByLabelText, getByText, queryByText} = render(
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

    await waitFor(() =>
      getByText('An error occurred while marking link read.'),
    );

    // clear error
    http.patch.mockResolvedValue(jsonApiResponse());

    fireEvent.press(getByLabelText('Actions'));
    await waitFor(() => getByText('Mark Read'));
    fireEvent.press(getByText('Mark Read'));

    expect(
      queryByText('An error occurred while marking link read.'),
    ).toBeNull();
    await waitForElementToBeRemoved(() => getByText(bookmark.attributes.title));
  });

  it('allows deleting a link', async () => {
    const http = mockHttp();
    http.get.mockResolvedValue(jsonApiResponse([bookmark]));
    http.delete.mockResolvedValue(jsonApiResponse());

    const {getByLabelText, getByText, queryByText} = render(
      <PaperProvider>
        <TokenProvider skipLoading>
          <UnreadScreen />
        </TokenProvider>
      </PaperProvider>,
    );

    await waitFor(() => getByLabelText('Actions'));
    fireEvent.press(getByLabelText('Actions'));

    await waitFor(() => getByText('Delete'));
    fireEvent.press(getByText('Delete'));

    expect(http.delete).toHaveBeenCalledWith('bookmarks/1');

    await waitForElementToBeRemoved(() => getByText('Delete'));
    // TODO: fix warning with Menu disappearing
    expect(queryByText(bookmark.attributes.title)).toBeNull();
  });
});
