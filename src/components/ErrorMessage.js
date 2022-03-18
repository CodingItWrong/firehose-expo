import {Text, withTheme} from 'react-native-paper';

function ErrorMessage({children, theme}) {
  const errorMessageStyle = {
    color: theme.colors.error,
    textAlign: 'center',
    margin: 10,
  };

  return children && <Text style={errorMessageStyle}>{children}</Text>;
}

export default withTheme(ErrorMessage);
