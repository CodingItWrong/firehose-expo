import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import RefreshableFlatList from '../../../components/RefreshableFlatList';
import Tag from '../../../components/Tag';
import {useTags} from '../../../data/tags';

export default function TagListScreen() {
  const insets = useSafeAreaInsets();
  const tagClient = useTags();
  const [tags, setTags] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const loadFromServer = useCallback(async () => {
    try {
      const response = await tagClient.all();
      const loadedTags = response.data;
      setTags(loadedTags);
      return loadedTags;
    } catch (e) {
      setErrorMessage('An error occurred while loading tags.');
    }
  }, [tagClient]);

  useFocusEffect(
    useCallback(() => {
      loadFromServer();
    }, [loadFromServer]),
  );

  function listHeader() {
    if (errorMessage) {
      return <ErrorMessage>{errorMessage}</ErrorMessage>;
    } else if (tags?.length === 0) {
      return <NoRecordsMessage>No tags.</NoRecordsMessage>;
    } else {
      return null;
    }
  }

  return (
    <RefreshableFlatList
      ListHeaderComponent={listHeader()}
      data={tags}
      contentContainerStyle={{paddingBottom: insets.bottom}}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <Tag key={item.attributes.name} name={item.attributes.name} />
      )}
    />
  );
}
