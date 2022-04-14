import {useFocusEffect} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {jsonApiResponse, mockHttp, safeAreaMetrics} from '../../testUtils';
import ReadScreen from './ReadScreen';

jest.mock('../../data/httpClient');
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('ReadScreen', () => {
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://www.codingitwrong.com/books',
      comment: 'This is my book list',
      source: 'Nice Referrer',
      'tag-list': 'tag another-tag',
    },
  };

  const providers = children => (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <PaperProvider>
        <TokenProvider skipLoading>{children}</TokenProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );

  beforeEach(() => {
    // provide mock implementation of useFocusEffect to run only once
    let effectRun = false;
    useFocusEffect.mockImplementation(func => {
      if (!effectRun) {
        effectRun = true;
        func();
      }
    });
  });

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText} = render(providers(<ReadScreen />));

      expect(http.get).toHaveBeenCalledWith('bookmarks?filter[read]=true&');
      await findByText(bookmark.attributes.title);
    });
  });

  describe('adding a link', () => {
    it('does not allow adding a link to the list', async () => {
      const http = mockHttp();
      http.get.mockResolvedValue(jsonApiResponse([bookmark]));

      const {findByText, queryByLabelText} = render(providers(<ReadScreen />));

      await findByText(bookmark.attributes.title);

      expect(queryByLabelText('URL to Add')).toBeNull();
    });
  });
});
