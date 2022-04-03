import {fireEvent, render, waitFor} from '@testing-library/react-native';
import {useToken} from '../data/token';
import {mockHttp} from '../testUtils';
import SignInScreen from './SignInScreen';

jest.mock('../data/token', () => ({useToken: jest.fn()}));
jest.mock('../data/httpClient');

describe('SignInScreen', () => {
  const email = 'example@example.com';
  const password = 'password';
  const testToken = 'test_token';

  it('sets the token upon successful login', async () => {
    const http = mockHttp();
    http.post.mockResolvedValue({data: {access_token: testToken}});
    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    const {getByLabelText, getByText} = render(<SignInScreen />);

    fireEvent.changeText(getByLabelText('Email'), email);
    fireEvent.changeText(getByLabelText('Password'), password);
    fireEvent.press(getByText('Sign in'));

    expect(http.post).toHaveBeenCalledWith('/oauth/token', {
      grant_type: 'password',
      username: email,
      password,
    });
    await waitFor(() => expect(setToken).toHaveBeenCalledWith(testToken));
  });

  it('shows the returned auth error and does not set the token upon auth failure', async () => {
    const http = mockHttp();
    const errorMessage = 'errorMessage';
    http.post.mockRejectedValue({
      response: {data: {error_description: errorMessage}},
    });
    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    const {findByText, getByLabelText, getByText} = render(<SignInScreen />);

    fireEvent.changeText(getByLabelText('Email'), email);
    fireEvent.changeText(getByLabelText('Password'), password);
    fireEvent.press(getByText('Sign in'));

    await findByText(errorMessage);
    expect(setToken).not.toHaveBeenCalled();
  });

  it('shows a general error and does not set the token upon server failure', async () => {
    const http = mockHttp();
    http.post.mockRejectedValue();
    const setToken = jest.fn();
    useToken.mockReturnValue({setToken});

    const {findByText, getByLabelText, getByText} = render(<SignInScreen />);

    fireEvent.changeText(getByLabelText('Email'), email);
    fireEvent.changeText(getByLabelText('Password'), password);
    fireEvent.press(getByText('Sign in'));

    await findByText('An error occurred while logging in. Please try again.');
    expect(setToken).not.toHaveBeenCalled();
  });
});
