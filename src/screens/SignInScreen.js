import axios from 'axios';
import {Button, Text, TextInput} from 'react-native-paper';
import oauthLogin from '../auth/oauthLogin';
import useLoginForm from '../auth/useLoginForm';
import ScreenBackground from '../components/ScreenBackground';
import {useToken} from '../data/token';

// TODO: dynamic base URL per environment
const baseUrl = 'http://localhost:3000';
const path = '/api/oauth/token';
const httpClient = axios.create({baseURL: baseUrl});

export default function SignInScreen() {
  const {setToken} = useToken();
  const onLogIn = ({username, password}) =>
    oauthLogin({
      httpClient,
      path,
      username,
      password,
    }).then(setToken);
  const {username, password, error, handleChange, handleLogIn} =
    useLoginForm(onLogIn);

  return (
    <ScreenBackground>
      <TextInput
        label="Email"
        accessibilityLabel="Email"
        value={username}
        onChangeText={handleChange('username')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Password"
        accessibilityLabel="Password"
        value={password}
        onChangeText={handleChange('password')}
        secureTextEntry
      />
      <Text>{error}</Text>
      <Button
        mode="contained"
        onPress={handleLogIn}
        accessibilityLabel="Sign in"
      >
        Sign in
      </Button>
    </ScreenBackground>
  );
}
