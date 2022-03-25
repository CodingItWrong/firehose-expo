import * as Linking from 'expo-linking';
import {useEffect, useState} from 'react';
import {FlatList, Platform, Pressable} from 'react-native';
import {List, Menu} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ScreenBackground from '../../components/ScreenBackground';
import {useBookmarks} from '../../data/bookmarks';

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
  const [menuShownId, setMenuShownId] = useState(null);

  useEffect(() => {
    bookmarkClient
      .where({filter: {read: false}})
      .then(bookmarkResponse => setBookmarks(bookmarkResponse.data));
  }, [bookmarkClient]);

  // TODO: test list icon a11y label

  const isMenuShown = item => menuShownId === item.id;
  const showMenu = item => setMenuShownId(item.id);
  const hideMenu = () => setMenuShownId(null);

  return (
    <ScreenBackground>
      <CenterColumn>
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <List.Item
              title={item.attributes.title}
              description={item.attributes.url}
              onPress={() => openBookmark(item.attributes.url)}
              right={props => (
                <Menu
                  visible={isMenuShown(item)}
                  onDismiss={hideMenu}
                  anchor={
                    <Pressable onPress={() => showMenu(item)}>
                      <List.Icon {...props} icon="dots-vertical" />
                    </Pressable>
                  }
                >
                  <Menu.Item onPress={() => {}} title="Item 1" />
                </Menu>
              )}
            />
          )}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
