import {useNavigation} from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import {TokenProvider} from '../../data/token';
import TaggedLinksScreen from './TaggedLinksScreen';

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('TaggedLinksScreen', () => {
  const tagName = 'hypercard';

  const providers = children => (
    <TokenProvider skipLoading>{children}</TokenProvider>
  );

  it('sets the screen title to the tag', () => {
    const navigation = {setOptions: jest.fn()};
    useNavigation.mockReturnValue(navigation);

    const route = {params: {tag: tagName}};

    render(providers(<TaggedLinksScreen route={route} />));

    expect(navigation.setOptions).toHaveBeenCalledWith({title: tagName});
  });
});
