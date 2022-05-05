import {useCallback, useState} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useBookmarks} from '../../../data/bookmarks';

export default function UnreadScreen() {
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(null);
  const [searchText, setSearchText] = useState('');
  const bookmarkClient = useBookmarks();

  const onLoad = useCallback(async () => {
    const filter = {read: true};
    if (searchText !== '') {
      filter.title = searchText;
    }
    const response = await bookmarkClient.where({
      filter,
      options: {'page[number]': page},
    });
    setMaxPage(response.meta['page-count']);
    return response;
  }, [bookmarkClient, page, searchText]);

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
      showSearchForm
      onSearch={setSearchText}
    />
  );
}
