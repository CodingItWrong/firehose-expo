import {
  useFocusEffect,
  useLinkTo,
  useNavigation,
} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useBookmarks} from '../../data/bookmarks';
import CenterColumn from '../CenterColumn';
import PaginationControls from '../PaginationControls';
import {LOADING_INDICATOR} from '../RefreshableFlatList';
import ScreenBackground from '../ScreenBackground';
import BookmarkFlatList from './BookmarkFlatList';
import NewBookmarkForm from './NewBookmarkForm';
import SearchForm from './SearchForm';

export default function BookmarkList({
  query,
  queryKey,
  extraDetailParams,
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
  const [isCreating, setIsCreating] = useState(false);
  const listRef = useRef(null);
  const bookmarksResult = useQuery(queryKey, query);
  const queryClient = useQueryClient();

  const loadingIndicatorToUse = isPerformingInitialLoad
    ? LOADING_INDICATOR.STANDALONE
    : loadingIndicator;
  const errorMessageToUse =
    errorMessage ||
    (bookmarksResult.error && 'An error occurred while loading links.');

  const refresh = useCallback(
    newLoadingIndicator => {
      queryClient.invalidateQueries(queryKey);
    },
    [queryClient, queryKey],
  );

  const refreshWithLoadingIndicator = useCallback(
    newLoadingIndicator => {
      setLoadingIndicator(newLoadingIndicator);
      refresh();
    },
    [refresh],
  );

  useEffect(() => {
    if (!bookmarksResult.isFetching) {
      setIsPerformingInitialLoad(false);
      setLoadingIndicator(null);
    }
  }, [bookmarksResult.isFetching]);

  useFocusEffect(refresh);

  async function addBookmark(url) {
    try {
      clearErrorMessage();
      setIsCreating(true);
      await bookmarkClient.create({attributes: {url}});
      refresh();
    } catch (e) {
      setErrorMessage('An error occurred while adding URL.');
      throw e;
    } finally {
      setIsCreating(false);
    }
  }

  function goToBookmark(bookmark) {
    navigation.navigate('BookmarkDetailScreen', {
      id: bookmark.id,
      ...extraDetailParams,
    });
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
      refresh();
    } catch (e) {
      setErrorMessage('An error occurred while marking link read.');
      throw e;
    }
  }

  async function markUnread(bookmark) {
    try {
      clearErrorMessage();
      await bookmarkClient.update({
        id: bookmark.id,
        attributes: {read: false},
      });
      refresh();
    } catch {
      setErrorMessage('An error occurred while marking link unread.');
    }
  }

  async function deleteBookmark(bookmark) {
    try {
      clearErrorMessage();
      await bookmarkClient.delete({id: bookmark.id});
      refresh();
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
        {paginate && bookmarksResult.data && (
          <PaginationControls
            pageNumber={pageNumber}
            maxPageNumber={maxPageNumber}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
          />
        )}
        <BookmarkFlatList
          listRef={listRef}
          loadingIndicator={loadingIndicatorToUse}
          bookmarks={bookmarksResult.data}
          errorMessage={errorMessageToUse}
          onEdit={goToBookmark}
          onPressTag={goToTag}
          onRefresh={refreshWithLoadingIndicator}
          onMarkRead={markRead}
          onMarkUnread={markUnread}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
