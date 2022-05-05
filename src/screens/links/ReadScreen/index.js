import {useCallback, useState} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useBookmarks} from '../../../data/bookmarks';

export default function UnreadScreen() {
  const [page, setPage] = useState(1);
  const bookmarkClient = useBookmarks();

  const onLoad = useCallback(
    () =>
      bookmarkClient.where({
        filter: {read: true},
        options: {'page[number]': page},
      }),
    [bookmarkClient, page],
  );

  const increment = () => setPage(page + 1);
  const decrement = () => setPage(page - 1);

  // TODO: make this dynamic
  const maxPageNumber = 10;

  return (
    <BookmarkList
      onLoad={onLoad}
      paginate
      pageNumber={page}
      maxPageNumber={maxPageNumber}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
}
