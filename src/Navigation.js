import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';
import {Button} from 'react-native-paper';
import CustomNavigationBar from './components/CustomNavigationBar';
import CustomNavigationDrawer from './components/CustomNavigationDrawer';

const HelloStack = createNativeStackNavigator();
const Hello = () => (
  <HelloStack.Navigator
    screenOptions={{
      header: props => <CustomNavigationBar {...props} />,
    }}
  >
    <HelloStack.Screen
      name="HelloDetail"
      component={HelloDetail}
      options={{title: 'Hello!!'}}
    />
  </HelloStack.Navigator>
);

function HelloDetail() {
  return (
    <>
      <Text>Hello, Navigation!</Text>
      <Button mode="contained">Hello Paper</Button>
    </>
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
      name="AnotherDetail"
      component={AnotherDetail}
      options={{title: 'Another!!'}}
    />
  </AnotherStack.Navigator>
);

function AnotherDetail() {
  return <Text>Another Screen</Text>;
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
