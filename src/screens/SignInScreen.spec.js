import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import nock from 'nock';
import {useToken} from '../data/token';
import SignInScreen from './SignInScreen';

jest.mock('../data/token', () => ({useToken: jest.fn()}));

describe('SignInScreen', () => {
  const email = 'example@example.com';
  const password = 'password';
  const testToken = 'test_token';

  it('sets the token upon successful login', async () => {
    nock('http://localhost:3000')
      .post('/api/oauth/token', {
        grant_type: 'password',
        username: email,
        password,
      })
      .reply(200, {access_token: testToken});

    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    render(<SignInScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), email);
    fireEvent.changeText(screen.getByLabelText('Password'), password);
    fireEvent.press(screen.getByText('Sign in'));

    await waitFor(() => expect(setToken).toHaveBeenCalledWith(testToken));
  });

  it('shows the returned auth error and does not set the token upon auth failure', async () => {
    const errorMessage = 'errorMessage';
    nock('http://localhost:3000')
      .post('/api/oauth/token', {
        grant_type: 'password',
        username: email,
        password,
      })
      .reply(401, {error_description: errorMessage});

    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    render(<SignInScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), email);
    fireEvent.changeText(screen.getByLabelText('Password'), password);
    fireEvent.press(screen.getByText('Sign in'));

    await screen.findByText(errorMessage);
    expect(setToken).not.toHaveBeenCalled();
  });

  it('shows a general error and does not set the token upon server failure', async () => {
    nock('http://localhost:3000')
      .post('/api/oauth/token', {
        grant_type: 'password',
        username: email,
        password,
      })
      .reply(500);

    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    render(<SignInScreen />);

    fireEvent.changeText(screen.getByLabelText('Email'), email);
    fireEvent.changeText(screen.getByLabelText('Password'), password);
    fireEvent.press(screen.getByText('Sign in'));

    await screen.findByText(
      'An error occurred while logging in. Please try again.',
    );
    expect(setToken).not.toHaveBeenCalled();
  });
});
