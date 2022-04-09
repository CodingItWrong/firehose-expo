import {useNavigation} from '@react-navigation/native';
import {Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import RefreshableFlatList from '../../../components/RefreshableFlatList';
import UnreadBookmarkRow from './UnreadBookmarkRow';

export default function UnreadBookmarkList({
  listRef,
  isPerformingInitialLoad,
  bookmarks,
  errorMessage,
  onRefresh,
  onMarkRead,
  onDelete,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
      showLoadingIndicator={isPerformingInitialLoad}
      contentContainerStyle={[styles.list, {paddingBottom: insets.bottom}]}
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
    marginBottom: 15,
  },
});
