import {useCallback, useEffect, useState} from 'react';
import CenterColumn from '../../../components/CenterColumn';
import ScreenBackground from '../../../components/ScreenBackground';
import {useBookmarks} from '../../../data/bookmarks';
import NewBookmarkForm from './NewBookmarkForm';
import UnreadBookmarkList from './UnreadBookmarkList';

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();

  const [errorMessage, setErrorMessage] = useState(null);
  const clearErrorMessage = () => setErrorMessage(null);
  const [bookmarks, setBookmarks] = useState(null);
  const removeBookmark = bookmarkToRemove =>
    setBookmarks(
      bookmarks.filter(bookmark => bookmark.id !== bookmarkToRemove.id),
    );
  const [isCreating, setIsCreating] = useState(false);

  const loadFromServer = useCallback(async () => {
    try {
      const response = await bookmarkClient.where({filter: {read: false}});
      setBookmarks(response.data);
    } catch (e) {
      setErrorMessage('An error occurred while loading links.');
    }
  }, [bookmarkClient]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const addBookmark = async url => {
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
          onRefresh={loadFromServer}
          onMarkRead={markRead}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
