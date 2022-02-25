import {Appbar} from 'react-native-paper';

export default function CustomNavigationBar({navigation, options, back}) {
  return (
    <Appbar.Header>
      {back && (
        <Appbar.BackAction
          onPress={navigation.goBack}
          accessibilityLabel="Back"
        />
      )}
      <Appbar.Content title={options.title} />
      <Appbar.Action
        accessibilityLabel="Menu"
        icon="menu"
        onPress={navigation.toggleDrawer}
      />
    </Appbar.Header>
  );
}
