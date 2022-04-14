import {Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import RefreshableFlatList from '../../../components/RefreshableFlatList';
import BookmarkRow from './BookmarkRow';

export default function BookmarkFlatList({
  listRef,
  isPerformingInitialLoad,
  bookmarks,
  errorMessage,
  onEdit,
  onRefresh,
  onMarkRead,
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
      testID="unread-bookmarks-list"
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
    marginBottom: 15,
  },
});
