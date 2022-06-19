import {useNavigation} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import nock from 'nock';
import {mockUseFocusEffect, providers} from '../../testUtils';
import TaggedLinksScreen from './TaggedLinksScreen';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useLinkTo: jest.fn(),
  useNavigation: jest.fn(),
}));

describe('TaggedLinksScreen', () => {
  const tagName = 'hypercard';
  const route = {params: {tag: tagName}};
  const bookmark = {
    id: '1',
    attributes: {
      title: 'Test Bookmark',
      url: 'https://www.codingitwrong.com/books',
      comment: 'This is my book list',
      source: 'Nice Referrer',
      'tag-list': tagName,
      read: true,
    },
  };

  let navigation;

  beforeEach(() => {
    navigation = {setOptions: jest.fn()};
    useNavigation.mockReturnValue(navigation);
    mockUseFocusEffect();
  });

  it('sets the screen title to the tag', () => {
    render(providers(<TaggedLinksScreen route={route} />));

    expect(navigation.setOptions).toHaveBeenCalledWith({title: tagName});
  });

  describe('displaying links', () => {
    it('renders links from the backend', async () => {
      const mockedServer = nock('http://localhost:3000')
        .get(`/api/tags?filter[name]=${tagName}&include=bookmarks`)
        .reply(200, {included: [bookmark]});

      const {findByText} = render(
        providers(<TaggedLinksScreen route={route} />),
      );

      await findByText(bookmark.attributes.title);

      mockedServer.done();
    });
  });
});
