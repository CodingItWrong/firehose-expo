import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import RefreshableFlatList from '../../../components/RefreshableFlatList';
import UnreadBookmarkRow from './UnreadBookmarkRow';

export default function UnreadBookmarkList({
  listRef,
  bookmarks,
  errorMessage,
  onRefresh,
  onMarkRead,
  onDelete,
}) {
  const navigation = useNavigation();
  const [menuShownId, setMenuShownId] = useState(null);

  const isMenuShown = bookmark => menuShownId === bookmark.id;
  const showMenu = bookmark => setMenuShownId(bookmark.id);
  const hideMenu = () => setMenuShownId(null);

  function handleEdit(bookmark) {
    hideMenu();
    navigation.navigate('BookmarkDetailScreen', {id: bookmark.id});
  }

  async function handleMarkRead(bookmark) {
    await onMarkRead(bookmark);
    hideMenu();
  }

  async function handleDelete(bookmark) {
    await onDelete(bookmark);
    hideMenu();
  }

  function listHeader() {
    if (errorMessage) {
      return <ErrorMessage>{errorMessage}</ErrorMessage>;
    } else if (bookmarks?.length === 0) {
      return <NoRecordsMessage>No unread links.</NoRecordsMessage>;
    } else {
      return null;
    }
  }

  return (
    <RefreshableFlatList
      listRef={listRef}
      testID="unread-bookmarks-list"
      ListHeaderComponent={listHeader()}
      data={bookmarks}
      onRefresh={onRefresh}
      showLoadingIndicator={bookmarks === null}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <UnreadBookmarkRow
          bookmark={item}
          isMenuShown={isMenuShown(item)}
          onShowMenu={() => showMenu(item)}
          onHideMenu={hideMenu}
          onEdit={() => handleEdit(item)}
          onMarkRead={() => handleMarkRead(item)}
          onDelete={() => handleDelete(item)}
        />
      )}
    />
  );
}
