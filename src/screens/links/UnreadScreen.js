import * as Linking from 'expo-linking';
import {useEffect, useState} from 'react';
import {FlatList, Platform, Pressable} from 'react-native';
import {List, Menu, TextInput} from 'react-native-paper';
import CenterColumn from '../../components/CenterColumn';
import ErrorMessage from '../../components/ErrorMessage';
import NoRecordsMessage from '../../components/NoRecordsMessage';
import ScreenBackground from '../../components/ScreenBackground';
import {useBookmarks} from '../../data/bookmarks';

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();

  const [errorMessage, setErrorMessage] = useState(null);
  const clearErrorMessage = () => setErrorMessage(null);
  const [bookmarks, setBookmarks] = useState([]);
  const removeBookmark = bookmarkToRemove =>
    setBookmarks(
      bookmarks.filter(bookmark => bookmark.id !== bookmarkToRemove.id),
    );
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    bookmarkClient
      .where({filter: {read: false}})
      .then(bookmarkResponse => setBookmarks(bookmarkResponse.data))
      .catch(e => setErrorMessage('An error occurred while loading links.'));
  }, [bookmarkClient]);

  const addBookmark = async url => {
    try {
      clearErrorMessage();
      setIsCreating(true);
      const response = await bookmarkClient.create({attributes: {url}});
      const newBookmark = response.data;
      setBookmarks([newBookmark, ...bookmarks]);
      setIsCreating(false);
    } catch (e) {
      setErrorMessage('An error occurred while adding URL.');
      throw e;
    }
  };

  const markRead = async bookmark => {
    try {
      clearErrorMessage();
      await bookmarkClient.update({
        id: bookmark.id,
        attributes: {read: true},
      });
      removeBookmark(bookmark);
    } catch {
      setErrorMessage('An error occurred while marking link read.');
    }
  };

  const deleteBookmark = async bookmark => {
    try {
      clearErrorMessage();
      await bookmarkClient.delete({id: bookmark.id});
      removeBookmark(bookmark);
    } catch (e) {
      setErrorMessage('An error occurred while deleting link.');
    }
  };

  return (
    <ScreenBackground>
      <CenterColumn>
        <NewBookmarkForm isCreating={isCreating} onCreate={addBookmark} />
        <UnreadBookmarkList
          bookmarks={bookmarks}
          errorMessage={errorMessage}
          onMarkRead={markRead}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}

function NewBookmarkForm({isCreating, onCreate}) {
  const [url, setUrl] = useState('');

  async function handleCreate() {
    if (url !== '') {
      try {
        await onCreate(url);
        setUrl('');
      } catch {
        // no-op
      }
    }
  }

  return (
    <TextInput
      label="URL to Add"
      accessibilityLabel="URL to Add"
      value={url}
      onChangeText={setUrl}
      onSubmitEditing={handleCreate}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={Platform.OS === 'android' ? 'default' : 'url'}
      right={
        isCreating && (
          <TextInput.Icon
            icon="clock-outline"
            accessibilityLabel="Adding URL"
          />
        )
      }
    />
  );
}

function UnreadBookmarkList({bookmarks, errorMessage, onMarkRead, onDelete}) {
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

  function listHeader() {
    if (errorMessage) {
      return <ErrorMessage>{errorMessage}</ErrorMessage>;
    } else if (bookmarks.length === 0) {
      return <NoRecordsMessage>No unread links.</NoRecordsMessage>;
    } else {
      return null;
    }
  }

  return (
    <FlatList
      ListHeaderComponent={listHeader()}
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
      titleNumberOfLines={3}
      description={bookmark.attributes.url}
      descriptionNumberOfLines={1}
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
