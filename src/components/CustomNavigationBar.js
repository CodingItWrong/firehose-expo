import {Appbar} from 'react-native-paper';
import {large, useBreakpoint} from '../breakpoints';

const showDrawerToggleForBreakpoint = breakpoint => breakpoint !== large;

export default function CustomNavigationBar({navigation, options, back}) {
  const breakpoint = useBreakpoint();
  const showDrawerToggle = showDrawerToggleForBreakpoint(breakpoint);

  return (
    <Appbar.Header>
      {back && (
        <Appbar.BackAction
          onPress={navigation.goBack}
          accessibilityLabel="Back"
        />
      )}
      <Appbar.Content title={options.title} />
      {showDrawerToggle && (
        <Appbar.Action
          accessibilityLabel="Menu"
          icon="menu"
          onPress={navigation.toggleDrawer}
        />
      )}
    </Appbar.Header>
  );
}
