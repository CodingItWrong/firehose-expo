import {useState} from 'react';
import {Platform} from 'react-native';
import {TextInput} from 'react-native-paper';

export default function NewBookmarkForm({isCreating, onCreate}) {
  const [url, setUrl] = useState('');

  async function handleCreate() {
    if (url !== '') {
      try {
        await onCreate(url);
        setUrl('');
      } catch {
        // no-op
      }
    }
  }

  return (
    <TextInput
      label="URL to Add"
      accessibilityLabel="URL to Add"
      value={url}
      onChangeText={setUrl}
      onSubmitEditing={handleCreate}
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType={Platform.OS === 'android' ? 'default' : 'url'}
      right={
        isCreating && (
          <TextInput.Icon
            icon="clock-outline"
            accessibilityLabel="Adding URL"
          />
        )
      }
    />
  );
}
