import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer} from '@react-navigation/native';
import {Text} from 'react-native';

function Hello() {
  return <Text>Hello, Navigation!</Text>;
}

const Drawer = createDrawerNavigator();

function NavigationContents() {
  // return <Hello />;
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Hello" component={Hello} />
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
