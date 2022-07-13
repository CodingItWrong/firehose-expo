import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {large, useBreakpoint} from './breakpoints';
import CustomNavigationBar from './components/CustomNavigationBar';
import CustomNavigationDrawer from './components/CustomNavigationDrawer';
import {useToken} from './data/token';
import SignInScreen from './screens/SignInScreen';
import BookmarkDetailScreen from './screens/links/BookmarkDetailScreen';
import ReadScreen from './screens/links/ReadScreen';
import UnreadScreen from './screens/links/UnreadScreen';
import TagListScreen from './screens/tags/TagListScreen';
import TaggedLinksScreen from './screens/tags/TaggedLinksScreen';

const linking = {
  config: {
    screens: {
      'Sign in': {
        initialRouteName: 'SignInScreen',
        screens: {
          SignInScreen: '/sign-in',
        },
      },
      Unread: {
        path: '/links/unread',
        initialRouteName: 'UnreadScreen',
        screens: {
          UnreadScreen: '',
          BookmarkDetailScreen: ':id',
        },
      },
      Read: {
        path: '/links/read',
        initialRouteName: 'ReadScreen',
        screens: {
          ReadScreen: '',
          BookmarkDetailScreen: ':id',
        },
      },
      Tags: {
        path: '/tags',
        initialRouteName: 'TagListScreen',
        screens: {
          TagListScreen: '',
          TaggedLinksScreen: ':tag',
          BookmarkDetailScreen: ':tag/:id',
        },
      },
    },
  },
};

const stackScreenOptions = {
  header: props => <CustomNavigationBar {...props} />,
};

const UnreadStack = createNativeStackNavigator();
const Unread = () => (
  <UnreadStack.Navigator screenOptions={stackScreenOptions}>
    <UnreadStack.Screen
      name="UnreadScreen"
      component={UnreadScreen}
      options={{title: 'Unread Links'}}
    />
    <UnreadStack.Screen
      name="BookmarkDetailScreen"
      component={BookmarkDetailScreen}
      options={{title: 'Edit Link'}}
    />
  </UnreadStack.Navigator>
);

const ReadStack = createNativeStackNavigator();
const Read = () => (
  <ReadStack.Navigator screenOptions={stackScreenOptions}>
    <ReadStack.Screen
      name="ReadScreen"
      component={ReadScreen}
      options={{title: 'Read Links'}}
    />
    <ReadStack.Screen
      name="BookmarkDetailScreen"
      component={BookmarkDetailScreen}
      options={{title: 'Edit Link'}}
    />
  </ReadStack.Navigator>
);

const TagStack = createNativeStackNavigator();
const Tags = () => (
  <TagStack.Navigator screenOptions={stackScreenOptions}>
    <TagStack.Screen
      name="TagListScreen"
      component={TagListScreen}
      options={{title: 'Tags'}}
    />
    <TagStack.Screen name="TaggedLinksScreen" component={TaggedLinksScreen} />
    <ReadStack.Screen
      name="BookmarkDetailScreen"
      component={BookmarkDetailScreen}
      options={{title: 'Edit Link'}}
    />
  </TagStack.Navigator>
);

const SignInStack = createNativeStackNavigator();
const SignIn = () => (
  <SignInStack.Navigator screenOptions={stackScreenOptions}>
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

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: drawerTypeForBreakpoint,
        drawerStyle: {width: 150},
      }}
      drawerContent={props => <CustomNavigationDrawer {...props} />}
    >
      {isLoggedIn ? (
        <>
          <Drawer.Screen name="Unread" component={Unread} />
          <Drawer.Screen name="Read" component={Read} />
          <Drawer.Screen name="Tags" component={Tags} />
        </>
      ) : (
        <Drawer.Screen name="Sign in" component={SignIn} />
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
