import {useNavigation} from '@react-navigation/native';
import reverse from 'lodash/reverse';
import sortBy from 'lodash/sortBy';
import {useCallback, useEffect} from 'react';
import BookmarkList from '../../../components/BookmarkList';
import {useTags} from '../../../data/tags';

export default function TaggedLinksScreen({route}) {
  const navigation = useNavigation();
  const tagName = route.params.tag;
  const tagClient = useTags();

  useEffect(() => {
    navigation.setOptions({title: tagName});
  }, [navigation, tagName]);

  const onLoad = useCallback(async () => {
    const response = await tagClient.where({
      filter: {name: tagName},
      options: {include: 'bookmarks'},
    });
    const bookmarks = response.included;
    const sortedBookmarks = reverse(sortBy(bookmarks, 'moved-to-list-at'));
    // TODO: this is kind of hacky
    return {data: sortedBookmarks};
  }, [tagClient, tagName]);

  return <BookmarkList onLoad={onLoad} />;
}
