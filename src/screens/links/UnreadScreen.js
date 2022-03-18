import * as Linking from 'expo-linking';
import {Platform} from 'react-native';
import {List} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ScreenBackground from '../../components/ScreenBackground';
import sharedStyles from '../../sharedStyles';

function openBookmark(url) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

export default function UnreadScreen() {
  return (
    <ScreenBackground style={sharedStyles.bodyPadding}>
      <CenterColumn>
        <List.Item
          title="My Bookmark"
          description="codingitwrong.com"
          onPress={() => openBookmark('https://codingitwrong.com')}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
