import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {TextInput} from 'react-native-paper';
import {useBookmarks} from '../../../data/bookmarks';

export default function BookmarkDetailScreen({route}) {
  const {id} = route.params;
  const bookmarkClient = useBookmarks();
  const [bookmark, setBookmark] = useState(null);

  useEffect(() => {
    bookmarkClient
      .find({id})
      .then(response => {
        setBookmark(response.data);
      })
      .catch(console.error);
  }, [bookmarkClient, id]);

  if (!bookmark) {
    return null; // TODO: loading state
  }

  return (
    <View>
      <TextInput
        label="URL"
        accessibilityLabel="URL"
        value={bookmark.attributes.url}
      />
    </View>
  );
}
