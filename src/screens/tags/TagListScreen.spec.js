import {useFocusEffect} from '@react-navigation/native';
import {fireEvent, render} from '@testing-library/react-native';
import nock from 'nock';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {TokenProvider} from '../../data/token';
import {jsonApiResponseBody, safeAreaMetrics} from '../../testUtils';
import TagListScreen from './TagListScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('TagListScreen', () => {
  const tag = {id: '1', attributes: {name: 'hypercard'}};

  const providers = children => (
    <SafeAreaProvider initialMetrics={safeAreaMetrics}>
      <TokenProvider skipLoading>{children}</TokenProvider>
    </SafeAreaProvider>
  );

  beforeEach(() => {
    // provide mock implementation of useFocusEffect to run once each time callback changes
    let lastCallback = null;
    useFocusEffect.mockImplementation(callback => {
      if (lastCallback !== callback) {
        lastCallback = callback;
        callback();
      }
    });
  });

  describe('displaying tags', () => {
    it('renders tags from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get('/api/tags?')
        .reply(200, jsonApiResponseBody([tag]));

      const {findByText} = render(providers(<TagListScreen />));

      await findByText(tag.attributes.name);

      mockedServer.done();
    });

    it('shows an error message when loading tags fails', async () => {
      nock('http://localhost:3000').get('/api/tags?').reply(500);

      const {findByText, queryByLabelText} = render(
        providers(<TagListScreen />),
      );

      await findByText('An error occurred while loading tags.');
      expect(queryByLabelText('Loading')).toBeNull();
    });

    it('shows a message when there are no tags to display', async () => {
      nock('http://localhost:3000')
        .get('/api/tags?')
        .reply(200, jsonApiResponseBody([]));

      const {findByText} = render(providers(<TagListScreen />));

      await findByText('No tags.');
    });
  });

  describe('refreshing', () => {
    describe('pulling on mobile', () => {
      it('refreshes the list', async () => {
        nock('http://localhost:3000')
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([tag]));

        const {findByText, getByTestId} = render(providers(<TagListScreen />));

        await findByText('No tags.');

        fireEvent(getByTestId('tag-list'), 'refresh');
        expect(getByTestId('tag-list')).toHaveProp('refreshing', true);

        await findByText(tag.attributes.name);
        expect(getByTestId('tag-list')).toHaveProp('refreshing', false);
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/tags?')
          .reply(500);

        const {findByText, getByTestId} = render(providers(<TagListScreen />));

        await findByText('No tags.');

        fireEvent(getByTestId('tag-list'), 'refresh');

        await findByText('An error occurred while loading tags.');
        expect(getByTestId('tag-list')).toHaveProp('refreshing', false);
      });
    });

    describe('clicking a button on web', () => {
      it('refreshes the list', async () => {
        nock('http://localhost:3000')
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([tag]));

        const {findByText, getByText, queryByLabelText} = render(
          providers(<TagListScreen />),
        );

        await findByText('No tags.');

        fireEvent.press(getByText('Reload'));
        expect(queryByLabelText('Loading')).not.toBeNull();

        await findByText(tag.attributes.name);
        expect(queryByLabelText('Loading')).toBeNull();
      });

      it('shows an error upon reload failure', async () => {
        nock('http://localhost:3000')
          .get('/api/tags?')
          .reply(200, jsonApiResponseBody([]))
          .get('/api/tags?')
          .reply(500);

        const {findByText, getByText, queryByLabelText} = render(
          providers(<TagListScreen />),
        );

        await findByText('No tags.');

        fireEvent.press(getByText('Reload'));

        await findByText('An error occurred while loading tags.');
        expect(queryByLabelText('Loading')).toBeNull();
      });
    });
  });
});
