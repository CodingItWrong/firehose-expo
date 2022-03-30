import * as Linking from 'expo-linking';
import {useEffect, useState} from 'react';
import {FlatList, Platform, Pressable} from 'react-native';
import {List, Menu} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ScreenBackground from '../../components/ScreenBackground';
import {useBookmarks} from '../../data/bookmarks';

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
  const markRead = async item => {
    try {
      await bookmarkClient.update({
        id: item.id,
        attributes: {read: true},
      });
      setMenuShownId(null);
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== item.id));
    } catch (e) {
      console.error('mark read failed', e);
    }
  };

  const deleteBookmark = async bookmark => {
    try {
      await bookmarkClient.delete({id: bookmark.id});
      setMenuShownId(null);
      setBookmarks(bookmarks.filter(b => b.id !== bookmark.id));
    } catch (e) {
      console.error('delete failed', e);
    }
  };

  return (
    <ScreenBackground>
      <CenterColumn>
        <FlatList
          data={bookmarks}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <UnreadBookmarkRow
              bookmark={item}
              isMenuShown={isMenuShown(item)}
              onShowMenu={() => showMenu(item)}
              onHideMenu={hideMenu}
              onMarkRead={() => markRead(item)}
              onDelete={() => deleteBookmark(item)}
            />
          )}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}

function openBookmark(url) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

function UnreadBookmarkRow({
  bookmark,
  isMenuShown,
  onShowMenu,
  onHideMenu,
  onMarkRead,
  onDelete,
}) {
  return (
    <List.Item
      title={bookmark.attributes.title}
      description={bookmark.attributes.url}
      onPress={() => openBookmark(bookmark.attributes.url)}
      right={props => (
        <Menu
          visible={isMenuShown}
          onDismiss={onHideMenu}
          anchor={
            <Pressable onPress={onShowMenu} accessibilityLabel="Actions">
              <List.Icon {...props} icon="dots-vertical" />
            </Pressable>
          }
        >
          <Menu.Item onPress={onMarkRead} title="Mark Read" />
          <Menu.Item onPress={onDelete} title="Delete" />
        </Menu>
      )}
    />
  );
}
