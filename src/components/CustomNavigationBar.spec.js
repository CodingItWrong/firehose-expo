import {fireEvent, render} from '@testing-library/react-native';
import {large, medium, useBreakpoint} from '../breakpoints';
import CustomNavigationBar from './CustomNavigationBar';

jest.mock('../breakpoints');

describe('CustomNavigationBar', () => {
  const title = 'Test Title';
  const options = {title};

  beforeEach(() => {
    useBreakpoint.mockReturnValue(large);
  });

  it('renders the title', () => {
    const {queryByText} = render(<CustomNavigationBar options={options} />);
    expect(queryByText(title)).not.toBeNull();
  });

  describe('back button', () => {
    it('renders a working back button if there is a back prop', () => {
      const navigation = {goBack: jest.fn()};
      const {getByLabelText} = render(
        <CustomNavigationBar back options={options} navigation={navigation} />,
      );

      fireEvent.press(getByLabelText('Back'));
      expect(navigation.goBack).toHaveBeenCalledWith();
    });

    it('does not render the back button if there is no back prop', () => {
      const {queryByLabelText} = render(
        <CustomNavigationBar options={options} />,
      );
      expect(queryByLabelText('Back')).toBeNull();
    });
  });

  describe('menu button', () => {
    it('does not render a menu button on larger screens', () => {
      useBreakpoint.mockReturnValue(large);

      const navigation = {toggleDrawer: jest.fn()};
      const {queryByLabelText} = render(
        <CustomNavigationBar options={options} navigation={navigation} />,
      );

      expect(queryByLabelText('Menu')).toBeNull();
    });

    it('renders a working menu button on smaller screens', () => {
      useBreakpoint.mockReturnValue(medium);

      const navigation = {toggleDrawer: jest.fn()};
      const {getByLabelText} = render(
        <CustomNavigationBar options={options} navigation={navigation} />,
      );

      fireEvent.press(getByLabelText('Menu'));
      expect(navigation.toggleDrawer).toHaveBeenCalledWith();
    });
  });
});
