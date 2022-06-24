import {fireEvent, render, screen} from '@testing-library/react-native';
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
    render(<CustomNavigationBar options={options} />);
    expect(screen.queryByText(title)).not.toBeNull();
  });

  describe('back button', () => {
    it('renders a working back button if there is a back prop', () => {
      const navigation = {goBack: jest.fn()};
      render(
        <CustomNavigationBar back options={options} navigation={navigation} />,
      );

      fireEvent.press(screen.getByLabelText('Back'));
      expect(navigation.goBack).toHaveBeenCalledWith();
    });

    it('does not render the back button if there is no back prop', () => {
      render(<CustomNavigationBar options={options} />);
      expect(screen.queryByLabelText('Back')).toBeNull();
    });
  });

  describe('menu button', () => {
    it('does not render a menu button on larger screens', () => {
      useBreakpoint.mockReturnValue(large);

      const navigation = {toggleDrawer: jest.fn()};
      render(<CustomNavigationBar options={options} navigation={navigation} />);

      expect(screen.queryByLabelText('Menu')).toBeNull();
    });

    it('renders a working menu button on smaller screens', () => {
      useBreakpoint.mockReturnValue(medium);

      const navigation = {toggleDrawer: jest.fn()};
      render(<CustomNavigationBar options={options} navigation={navigation} />);

      fireEvent.press(screen.getByLabelText('Menu'));
      expect(navigation.toggleDrawer).toHaveBeenCalledWith();
    });
  });
});
