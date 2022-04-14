import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {useBookmarks} from '../../data/bookmarks';
import CenterColumn from '../CenterColumn';
import ScreenBackground from '../ScreenBackground';
import BookmarkFlatList from './BookmarkFlatList';
import NewBookmarkForm from './NewBookmarkForm';

export default function BookmarkList({onLoad, showAddForm = false}) {
  const navigation = useNavigation();
  const bookmarkClient = useBookmarks();

  const [isPerformingInitialLoad, setIsPerformingInitialLoad] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const clearErrorMessage = () => setErrorMessage(null);
  const [bookmarks, setBookmarks] = useState(null);
  const removeBookmark = bookmarkToRemove =>
    setBookmarks(
      bookmarks.filter(bookmark => bookmark.id !== bookmarkToRemove.id),
    );
  const [isCreating, setIsCreating] = useState(false);
  const listRef = useRef(null);

  const loadFromServer = useCallback(async () => {
    try {
      const response = await onLoad();
      const loadedBookmarks = response.data;
      setBookmarks(loadedBookmarks);
      return loadedBookmarks;
    } catch (e) {
      setErrorMessage('An error occurred while loading links.');
    }
  }, [onLoad]);

  useFocusEffect(
    useCallback(() => {
      loadFromServer().finally(() => setIsPerformingInitialLoad(false));
    }, [loadFromServer]),
  );

  async function refresh() {
    const reloadedBookmarks = await loadFromServer();
    if (reloadedBookmarks.length > 0) {
      listRef.current.scrollToIndex({index: 0});
    }
  }

  async function addBookmark(url) {
    try {
      clearErrorMessage();
      setIsCreating(true);
      const response = await bookmarkClient.create({attributes: {url}});
      const newBookmark = response.data;
      setBookmarks(oldBookmarks => [newBookmark, ...oldBookmarks]);
    } catch (e) {
      setErrorMessage('An error occurred while adding URL.');
      throw e;
    } finally {
      setIsCreating(false);
    }
  }

  function goToBookmark(bookmark) {
    navigation.navigate('BookmarkDetailScreen', {id: bookmark.id});
  }

  async function markRead(bookmark) {
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
  }

  async function deleteBookmark(bookmark) {
    try {
      clearErrorMessage();
      await bookmarkClient.delete({id: bookmark.id});
      removeBookmark(bookmark);
    } catch (e) {
      setErrorMessage('An error occurred while deleting link.');
    }
  }

  return (
    <ScreenBackground>
      <CenterColumn>
        {showAddForm && (
          <NewBookmarkForm isCreating={isCreating} onCreate={addBookmark} />
        )}
        <BookmarkFlatList
          listRef={listRef}
          isPerformingInitialLoad={isPerformingInitialLoad}
          bookmarks={bookmarks}
          errorMessage={errorMessage}
          onEdit={goToBookmark}
          onRefresh={refresh}
          onMarkRead={markRead}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
