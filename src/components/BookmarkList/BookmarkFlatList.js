import {Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorMessage from '../ErrorMessage';
import NoRecordsMessage from '../NoRecordsMessage';
import RefreshableFlatList from '../RefreshableFlatList';
import BookmarkRow from './BookmarkRow';

export default function BookmarkFlatList({
  listRef,
  isPerformingInitialLoad,
  bookmarks,
  errorMessage,
  onEdit,
  onPressTag,
  onRefresh,
  onMarkRead,
  onMarkUnread,
  onDelete,
}) {
  const insets = useSafeAreaInsets();

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
      testID="bookmarks-list"
      ListHeaderComponent={listHeader()}
      data={bookmarks}
      onRefresh={onRefresh}
      showLoadingIndicator={isPerformingInitialLoad}
      contentContainerStyle={[styles.list, {paddingBottom: insets.bottom}]}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <BookmarkRow
          bookmark={item}
          style={styles.card}
          onEdit={() => onEdit(item)}
          onPressTag={onPressTag}
          onMarkRead={() => onMarkRead(item)}
          onMarkUnread={() => onMarkUnread(item)}
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
    marginBottom: 15,
  },
});
