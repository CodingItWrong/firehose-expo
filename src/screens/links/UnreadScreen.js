import * as Linking from 'expo-linking';
import {useEffect, useState} from 'react';
import {FlatList, Platform} from 'react-native';
import {List} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ScreenBackground from '../../components/ScreenBackground';
import {useBookmarks} from '../../data/bookmarks';
import sharedStyles from '../../sharedStyles';

function openBookmark(url) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    bookmarkClient
      .where({filter: {read: false}})
      .then(bookmarkResponse => setBookmarks(bookmarkResponse.data));
  }, [bookmarkClient]);

  return (
    <ScreenBackground style={sharedStyles.bodyPadding}>
      <CenterColumn>
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <List.Item
              title={item.attributes.title}
              description={item.attributes.url}
              onPress={() => openBookmark(item.attributes.url)}
            />
          )}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
