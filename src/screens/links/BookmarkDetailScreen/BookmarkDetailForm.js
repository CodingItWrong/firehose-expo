import {useState} from 'react';
import {Platform} from 'react-native';
import {Button, TextInput} from 'react-native-paper';
import {screenWidthMin, useStyleQueries} from 'react-native-style-queries';
import {breakpointMedium} from '../../../breakpoints';
import ButtonGroup from '../../../components/ButtonGroup';

export default function BookmarkDetailForm({attributes, onSave, onCancel}) {
  const styles = useStyleQueries(styleQueries);

  const [url, setUrl] = useState(attributes.url);
  const [title, setTitle] = useState(attributes.title);
  const [tagList, setTagList] = useState(attributes['tag-list']);
  const [source, setSource] = useState(attributes.source);
  const [comment, setComment] = useState(attributes.comment);

  function handleSave() {
    onSave({url, title, source, comment, 'tag-list': tagList});
  }

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
        <Button onPress={onCancel} mode="outlined" style={styles.button}>
          Cancel
        </Button>
        <Button onPress={handleSave} mode="contained" style={styles.button}>
          Save
        </Button>
      </ButtonGroup>
    </>
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
