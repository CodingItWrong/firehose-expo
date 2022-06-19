import {useCallback} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useBookmarks} from '../../../data/bookmarks';

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();

  const query = useCallback(
    () =>
      bookmarkClient
        .where({filter: {read: false}})
        .then(response => response.data),
    [bookmarkClient],
  );
  const queryKey = 'unread-links';

  return <BookmarkList query={query} queryKey={queryKey} showAddForm />;
}
