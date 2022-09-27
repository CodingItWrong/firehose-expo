import {useColorScheme} from 'react-native';
import {MD2DarkTheme, MD2LightTheme} from 'react-native-paper';

const FIREHOSE_RED = '#B71C1C';

export default function useTheme() {
  const colorScheme = useColorScheme();

  const baseTheme = colorScheme === 'dark' ? MD2DarkTheme : MD2LightTheme;

  const theme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: FIREHOSE_RED,
    },
  };

  return theme;
}
