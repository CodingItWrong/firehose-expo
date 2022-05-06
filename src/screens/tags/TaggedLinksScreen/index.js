import {useNavigation} from '@react-navigation/native';
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
    // TODO: this is kind of hacky
    return {data: response.included};
  }, [tagClient, tagName]);

  return <BookmarkList onLoad={onLoad} />;
}
