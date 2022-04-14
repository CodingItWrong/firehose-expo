import {useCallback} from 'react';
import {useBookmarks} from '../../../data/bookmarks';
import BookmarkList from './BookmarkList';

export default function UnreadScreen() {
  const bookmarkClient = useBookmarks();

  const onLoad = useCallback(
    () => bookmarkClient.where({filter: {read: false}}),
    [bookmarkClient],
  );

  return <BookmarkList onLoad={onLoad} />;
}
