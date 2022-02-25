import {Appbar} from 'react-native-paper';

export default function CustomNavigationBar({navigation, options}) {
  return (
    <Appbar.Header>
      <Appbar.Content title={options.title} />
      <Appbar.Action
        accessibilityLabel="Menu"
        icon="menu"
        onPress={navigation.toggleDrawer}
      />
    </Appbar.Header>
  );
}
