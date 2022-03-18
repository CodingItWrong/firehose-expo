import * as Linking from 'expo-linking';
import {List} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ScreenBackground from '../../components/ScreenBackground';
import sharedStyles from '../../sharedStyles';

export default function UnreadScreen() {
  return (
    <ScreenBackground style={sharedStyles.bodyPadding}>
      <CenterColumn>
        <List.Item
          title="My Bookmark"
          description="codingitwrong.com"
          onPress={() => Linking.openURL('https://codingitwrong.com')}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
