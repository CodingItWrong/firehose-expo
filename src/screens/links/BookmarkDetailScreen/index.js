import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {screenWidthMin, useStyleQueries} from 'react-native-style-queries';
import {breakpointMedium} from '../../../breakpoints';
import ButtonGroup from '../../../components/ButtonGroup';
import CenterColumn from '../../../components/CenterColumn';
import ScreenBackground from '../../../components/ScreenBackground';
import {useBookmarks} from '../../../data/bookmarks';
import sharedStyles from '../../../sharedStyles';

export default function BookmarkDetailScreen({route}) {
  const navigation = useNavigation();
  const {id} = route.params;
  const bookmarkClient = useBookmarks();
  const styles = useStyleQueries(styleQueries);

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

  async function handleSave() {
    try {
      await bookmarkClient.update({
        id,
        attributes: {url, title, source, comment, 'tag-list': tagList},
      });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  }

  function handleCancel() {
    navigation.goBack();
  }

  function contents() {
    if (!loaded) {
      return null; // TODO: loading state
    } else {
      return (
        <>
          <TextInput
            label="URL"
            accessibilityLabel="URL"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            keyboardType={Platform.OS === 'android' ? 'default' : 'url'}
            style={styles.formField}
          />
          <TextInput
            label="Title"
            accessibilityLabel="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.formField}
          />
          <TextInput
            label="Tags"
            accessibilityLabel="Tags"
            value={tagList}
            onChangeText={setTagList}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.formField}
          />
          <TextInput
            label="Source"
            accessibilityLabel="Source"
            value={source}
            onChangeText={setSource}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.formField}
          />
          <TextInput
            label="Comment"
            accessibilityLabel="Comment"
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
          />
          <ButtonGroup>
            <Button
              onPress={handleCancel}
              mode="outlined"
              style={styles.button}
            >
              Cancel
            </Button>
            <Button onPress={handleSave} mode="contained" style={styles.button}>
              Save
            </Button>
          </ButtonGroup>
        </>
      );
    }
  }

  return (
    <ScreenBackground>
      <CenterColumn columnStyle={sharedStyles.bodyPadding}>
        {contents()}
      </CenterColumn>
    </ScreenBackground>
  );
}

const styleQueries = {
  formField: {
    marginBottom: 10,
  },
  button: [
    {
      marginTop: 10,
    },
    screenWidthMin(breakpointMedium, {
      marginLeft: 10,
    }),
  ],
};
