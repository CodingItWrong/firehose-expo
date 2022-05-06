import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {Text} from 'react-native-paper';

export default function TaggedLinksScreen({route}) {
  const navigation = useNavigation();
  const tagName = route.params.tag;

  useEffect(() => {
    navigation.setOptions({title: tagName});
  }, [navigation, tagName]);

  return <Text>TaggedLinksScreen</Text>;
}
