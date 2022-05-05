import {useCallback, useState} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useBookmarks} from '../../../data/bookmarks';

export default function UnreadScreen() {
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(null);
  const bookmarkClient = useBookmarks();

  const onLoad = useCallback(async () => {
    const response = await bookmarkClient.where({
      filter: {read: true},
      options: {'page[number]': page},
    });
    setMaxPage(response.meta['page-count']);
    return response;
  }, [bookmarkClient, page]);

  const increment = () => setPage(page + 1);
  const decrement = () => setPage(page - 1);

  return (
    <BookmarkList
      onLoad={onLoad}
      paginate
      pageNumber={page}
      maxPageNumber={maxPage}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
}
