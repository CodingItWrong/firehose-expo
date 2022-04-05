import {useNavigation} from '@react-navigation/native';
import {Platform, StyleSheet} from 'react-native';
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

  function handleEdit(bookmark) {
    navigation.navigate('BookmarkDetailScreen', {id: bookmark.id});
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
      contentContainerStyle={styles.list}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <UnreadBookmarkRow
          bookmark={item}
          style={styles.card}
          onEdit={() => handleEdit(item)}
          onMarkRead={() => onMarkRead(item)}
          onDelete={() => onDelete(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: Platform.OS === 'web' ? 0 : 15,
  },
  card: {
    margin: 15,
    marginTop: 0,
  },
});
