import {
  useFocusEffect,
  useLinkTo,
  useNavigation,
} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
import {useBookmarks} from '../../data/bookmarks';
import CenterColumn from '../CenterColumn';
import PaginationControls from '../PaginationControls';
import ScreenBackground from '../ScreenBackground';
import BookmarkFlatList from './BookmarkFlatList';
import NewBookmarkForm from './NewBookmarkForm';
import SearchForm from './SearchForm';

export default function BookmarkList({
  onLoad,
  paginate,
  pageNumber,
  maxPageNumber,
  onIncrement,
  onDecrement,
  onSearch,
  showAddForm = false,
  showSearchForm = false,
}) {
  const navigation = useNavigation();
  const linkTo = useLinkTo();
  const bookmarkClient = useBookmarks();

  const [isPerformingInitialLoad, setIsPerformingInitialLoad] = useState(true);
  const [loadingIndicator, setLoadingIndicator] = useState(null);
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

  async function refresh(newLoadingIndicator) {
    setLoadingIndicator(newLoadingIndicator);
    try {
      const reloadedBookmarks = await loadFromServer();
      if (reloadedBookmarks.length > 0) {
        listRef.current.scrollToIndex({index: 0});
      }
    } finally {
      setLoadingIndicator(null);
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

  function goToTag(tagName) {
    linkTo(`/tags/${tagName}`);
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

  async function markUnread(bookmark) {
    try {
      clearErrorMessage();
      await bookmarkClient.update({
        id: bookmark.id,
        attributes: {read: false},
      });
      removeBookmark(bookmark);
    } catch {
      setErrorMessage('An error occurred while marking link unread.');
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
        {showSearchForm && <SearchForm onSubmit={onSearch} />}
        {paginate && (
          <PaginationControls
            pageNumber={pageNumber}
            maxPageNumber={maxPageNumber}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        )}
        <BookmarkFlatList
          listRef={listRef}
          isPerformingInitialLoad={isPerformingInitialLoad}
          loadingIndicator={loadingIndicator}
          bookmarks={bookmarks}
          errorMessage={errorMessage}
          onEdit={goToBookmark}
          onPressTag={goToTag}
          onRefresh={refresh}
          onMarkRead={markRead}
          onMarkUnread={markUnread}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
