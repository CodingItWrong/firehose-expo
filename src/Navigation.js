import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {large, useBreakpoint} from './breakpoints';
import CustomNavigationBar from './components/CustomNavigationBar';
import CustomNavigationDrawer from './components/CustomNavigationDrawer';
import {useToken} from './data/token';
import SignInScreen from './screens/SignInScreen';
import UnreadScreen from './screens/links/UnreadScreen';

const linking = {
  config: {
    screens: {
      Unread: {
        initialRouteName: 'UnreadScreen',
        screens: {
          UnreadScreen: '/links/unread',
        },
      },
    },
  },
};

const UnreadStack = createNativeStackNavigator();
const Unread = () => (
  <UnreadStack.Navigator
    screenOptions={{
      header: props => <CustomNavigationBar {...props} />,
    }}
  >
    <UnreadStack.Screen
      name="UnreadScreen"
      component={UnreadScreen}
      options={{title: 'Unread'}}
    />
  </UnreadStack.Navigator>
);

const SignInStack = createNativeStackNavigator();
const SignIn = () => (
  <SignInStack.Navigator
    screenOptions={{
      header: props => <CustomNavigationBar {...props} />,
    }}
  >
    <SignInStack.Screen
      name="SignInScreen"
      component={SignInScreen}
      options={{title: 'Sign in'}}
    />
  </SignInStack.Navigator>
);

const Drawer = createDrawerNavigator();

const getDrawerTypeForBreakpoint = breakpoint =>
  breakpoint === large ? 'permanent' : 'back';

function NavigationContents() {
  const {isLoggedIn} = useToken();
  const breakpoint = useBreakpoint();
  const drawerTypeForBreakpoint = getDrawerTypeForBreakpoint(breakpoint);

  // TODO: try to reproduce problem with too many updates from Surely
  // Couldn't reproduce so far in Safari and Firefox; fixed?

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: drawerTypeForBreakpoint,
      }}
      drawerContent={props => <CustomNavigationDrawer {...props} />}
    >
      {isLoggedIn ? (
        <>
          <Drawer.Screen name="Unread" component={Unread} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Sign in" component={SignIn} />
        </>
      )}
    </Drawer.Navigator>
  );
}

export default function Navigation() {
  // IMPORTANT: NavigationContainer needs to not rerender too often or
  // else Safari and Firefox error on too many history API calls. Put
  // any hooks in NavigationContents so this parent doesn't rerender.
  return (
    <NavigationContainer linking={linking}>
      <NavigationContents />
    </NavigationContainer>
  );
}
