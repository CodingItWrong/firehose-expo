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
  const removeBookmark = bookmarkToRemove =>
    setBookmarks(
      bookmarks.filter(bookmark => bookmark.id !== bookmarkToRemove.id),
    );

  useEffect(() => {
    bookmarkClient
      .where({filter: {read: false}})
      .then(bookmarkResponse => setBookmarks(bookmarkResponse.data));
  }, [bookmarkClient]);

  const markRead = async bookmark => {
    try {
      await bookmarkClient.update({
        id: bookmark.id,
        attributes: {read: true},
      });
      removeBookmark(bookmark);
    } catch (e) {
      console.error('mark read failed', e);
    }
  };

  const deleteBookmark = async bookmark => {
    try {
      await bookmarkClient.delete({id: bookmark.id});
      removeBookmark(bookmark);
    } catch (e) {
      console.error('delete failed', e);
    }
  };

  return (
    <ScreenBackground>
      <CenterColumn>
        <UnreadBookmarkList
          bookmarks={bookmarks}
          onMarkRead={markRead}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}

function UnreadBookmarkList({bookmarks, onMarkRead, onDelete}) {
  const [menuShownId, setMenuShownId] = useState(null);

  const isMenuShown = bookmark => menuShownId === bookmark.id;
  const showMenu = bookmark => setMenuShownId(bookmark.id);
  const hideMenu = () => setMenuShownId(null);

  async function handleMarkRead(item) {
    await onMarkRead(item);
    hideMenu();
  }

  async function handleDelete(item) {
    await onDelete(item);
    hideMenu();
  }

  return (
    <FlatList
      data={bookmarks}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <UnreadBookmarkRow
          bookmark={item}
          isMenuShown={isMenuShown(item)}
          onShowMenu={() => showMenu(item)}
          onHideMenu={hideMenu}
          onMarkRead={() => handleMarkRead(item)}
          onDelete={() => handleDelete(item)}
        />
      )}
    />
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
