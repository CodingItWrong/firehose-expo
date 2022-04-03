import {Button, TextInput} from 'react-native-paper';
import oauthLogin from '../auth/oauthLogin';
import useLoginForm from '../auth/useLoginForm';
import CenterColumn from '../components/CenterColumn';
import ErrorMessage from '../components/ErrorMessage';
import ScreenBackground from '../components/ScreenBackground';
import httpClient from '../data/httpClient';
import {useToken} from '../data/token';
import sharedStyles from '../sharedStyles';

export default function SignInScreen() {
  const {setToken} = useToken();
  const onLogIn = ({username, password}) =>
    oauthLogin({
      httpClient: httpClient(),
      username,
      password,
    }).then(setToken);
  const {username, password, error, handleChange, handleLogIn} =
    useLoginForm(onLogIn);

  return (
    <ScreenBackground style={sharedStyles.bodyPadding}>
      <CenterColumn>
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
        <ErrorMessage>{error}</ErrorMessage>
        <Button
          mode="contained"
          onPress={handleLogIn}
          accessibilityLabel="Sign in"
          style={sharedStyles.button}
        >
          Sign in
        </Button>
      </CenterColumn>
    </ScreenBackground>
  );
}
