import {useEffect, useState} from 'react';
import CenterColumn from '../../../components/CenterColumn';
import ScreenBackground from '../../../components/ScreenBackground';
import {useBookmarks} from '../../../data/bookmarks';
import NewBookmarkForm from './NewBookmarkForm';
import UnreadBookmarkList from './UnreadBookmarkList';

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
          onMarkRead={markRead}
          onDelete={deleteBookmark}
        />
      </CenterColumn>
    </ScreenBackground>
  );
}
