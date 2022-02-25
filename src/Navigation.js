import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {Text} from 'react-native';
import {Button} from 'react-native-paper';
import CustomNavigationDrawer from './components/CustomNavigationDrawer';

function Hello() {
  return (
    <>
      <Text>Hello, Navigation!</Text>
      <Button mode="contained">Hello Paper</Button>
    </>
  );
}

function Another() {
  return <Text>Another Screen</Text>;
}

const Drawer = createDrawerNavigator();

function NavigationContents() {
  // return <Hello />;
  return (
    <Drawer.Navigator
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
