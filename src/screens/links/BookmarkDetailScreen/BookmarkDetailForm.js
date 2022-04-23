import {useState} from 'react';
import {Platform} from 'react-native';
import {Button, TextInput as PaperTextInput} from 'react-native-paper';
import {screenWidthMin, useStyleQueries} from 'react-native-style-queries';
import {breakpointMedium} from '../../../breakpoints';
import ButtonGroup from '../../../components/ButtonGroup';

export default function BookmarkDetailForm({attributes, onSave, onCancel}) {
  const responsiveStyles = useStyleQueries(styleQueries);

  const [url, setUrl] = useState(attributes.url);
  const [title, setTitle] = useState(attributes.title);
  const [tagList, setTagList] = useState(attributes['tag-list']);
  const [source, setSource] = useState(attributes.source);
  const [comment, setComment] = useState(attributes.comment);

  const handleSave = () =>
    onSave({url, title, source, comment, 'tag-list': tagList});

  return (
    <>
      <TextInput
        label="URL"
        value={url}
        onChangeText={setUrl}
        keyboardType={Platform.OS === 'android' ? 'default' : 'url'}
      />
      <TextInput label="Title" value={title} onChangeText={setTitle} />
      <TextInput
        label="Tags"
        value={tagList}
        onChangeText={setTagList}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Source"
        value={source}
        onChangeText={setSource}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        label="Comment"
        accessibilityLabel="Comment"
        value={comment}
        onChangeText={setComment}
      />
      <ButtonGroup>
        <Button
          onPress={onCancel}
          mode="outlined"
          style={responsiveStyles.button}
        >
          Cancel
        </Button>
        <Button
          onPress={handleSave}
          mode="contained"
          style={responsiveStyles.button}
        >
          Save
        </Button>
      </ButtonGroup>
    </>
  );
}

const TextInput = ({label, ...props}) => (
  <PaperTextInput
    mode="outlined"
    multiline
    label={label}
    accessibilityLabel={label}
    style={styles.formField}
    {...props}
  />
);

const styles = {
  formField: {
    marginBottom: 10,
  },
};

const styleQueries = {
  button: [
    {
      marginBottom: 10,
    },
    screenWidthMin(breakpointMedium, {
      marginLeft: 10,
    }),
  ],
};
