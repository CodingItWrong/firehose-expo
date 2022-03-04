import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Button, Text} from 'react-native-paper';
import CustomNavigationBar from './components/CustomNavigationBar';
import CustomNavigationDrawer from './components/CustomNavigationDrawer';
import ScreenBackground from './components/ScreenBackground';

const HelloStack = createNativeStackNavigator();
const Hello = () => (
  <HelloStack.Navigator
    screenOptions={{
      header: props => <CustomNavigationBar {...props} />,
    }}
  >
    <HelloStack.Screen
      name="HelloScreen1"
      component={HelloScreen1}
      options={{title: 'Hello Screen 1'}}
    />
    <HelloStack.Screen
      name="HelloScreen2"
      component={HelloScreen2}
      options={{title: 'Hello Screen 2'}}
    />
  </HelloStack.Navigator>
);

function HelloScreen1() {
  const navigation = useNavigation();
  return (
    <ScreenBackground>
      <Text>Hello, screen 1!</Text>
      <Button mode="outlined">Outline button</Button>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('HelloScreen2')}
      >
        Go to screen 2
      </Button>
    </ScreenBackground>
  );
}

function HelloScreen2() {
  return (
    <ScreenBackground>
      <Text>Hello, screen 2!</Text>
    </ScreenBackground>
  );
}

const AnotherStack = createNativeStackNavigator();
const Another = () => (
  <AnotherStack.Navigator
    screenOptions={{
      header: props => <CustomNavigationBar {...props} />,
    }}
  >
    <AnotherStack.Screen
      name="AnotherScreen1"
      component={AnotherScreen1}
      options={{title: 'Another!!'}}
    />
  </AnotherStack.Navigator>
);

function AnotherScreen1() {
  return (
    <ScreenBackground>
      <Text>Another Screen</Text>
    </ScreenBackground>
  );
}

const Drawer = createDrawerNavigator();

function NavigationContents() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={props => <CustomNavigationDrawer {...props} />}
    >
      <Drawer.Screen name="Hello" component={Hello} />
      <Drawer.Screen name="Another" component={Another} />
    </Drawer.Navigator>
  );
}

export default function Navigation() {
  // IMPORTANT: NavigationContainer needs to not rerender too often or
  // else Safari and Firefox error on too many history API calls. Put
  // any hooks in NavigationContents so this parent doesn't rerender.
  return (
    <NavigationContainer>
      <NavigationContents />
    </NavigationContainer>
  );
}
