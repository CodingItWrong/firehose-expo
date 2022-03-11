import {Button, TextInput} from 'react-native-paper';
import useLoginForm from '../auth/useLoginForm';
import ScreenBackground from '../components/ScreenBackground';

export default function SignInScreen() {
  const {username, password, handleChange} = useLoginForm();

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
      <Button mode="contained" onPress={() => {}} accessibilityLabel="Sign in">
        Sign in
      </Button>
    </ScreenBackground>
  );
}
