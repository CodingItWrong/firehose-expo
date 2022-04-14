import {useCallback} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useBookmarks} from '../../../data/bookmarks';

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();

  const onLoad = useCallback(
    () => bookmarkClient.where({filter: {read: true}}),
    [bookmarkClient],
  );

  return <BookmarkList onLoad={onLoad} />;
}
