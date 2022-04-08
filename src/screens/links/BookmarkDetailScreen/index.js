import {useEffect, useState} from 'react';
import {View} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {useBookmarks} from '../../../data/bookmarks';

export default function BookmarkDetailScreen({route}) {
  const {id} = route.params;
  const bookmarkClient = useBookmarks();

  const [loaded, setLoaded] = useState(false);
  const [url, setUrl] = useState(null);
  const [title, setTitle] = useState(null);
  const [tagList, setTagList] = useState(null);
  const [source, setSource] = useState(null);
  const [comment, setComment] = useState(null);

  useEffect(() => {
    bookmarkClient
      .find({id})
      .then(response => {
        const {attributes} = response.data;
        setLoaded(true);
        setUrl(attributes.url);
        setTitle(attributes.title);
        setTagList(attributes['tag-list']);
        setSource(attributes.source);
        setComment(attributes.comment);
      })
      .catch(console.error);
  }, [bookmarkClient, id]);

  function handleSave() {
    bookmarkClient.update({
      id,
      attributes: {url, title, source, comment, 'tag-list': tagList},
    });
  }

  if (!loaded) {
    return null; // TODO: loading state
  }

  return (
    <View>
      <TextInput
        label="URL"
        accessibilityLabel="URL"
        value={url}
        onChangeText={setUrl}
      />
      <TextInput
        label="Title"
        accessibilityLabel="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        label="Tags"
        accessibilityLabel="Tags"
        value={tagList}
        onChangeText={setTagList}
      />
      <TextInput
        label="Source"
        accessibilityLabel="Source"
        value={source}
        onChangeText={setSource}
      />
      <TextInput
        label="Comment"
        accessibilityLabel="Comment"
        value={comment}
        onChangeText={setComment}
      />
      <Button onPress={handleSave}>Save</Button>
    </View>
  );
}
