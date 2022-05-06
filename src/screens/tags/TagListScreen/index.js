import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useRef, useState} from 'react';
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
  const [isPerformingInitialLoad, setIsPerformingInitialLoad] = useState(true);
  const listRef = useRef(null);

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
      loadFromServer().finally(() => setIsPerformingInitialLoad(false));
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

  async function refresh() {
    const reloadedTags = await loadFromServer();
    if (reloadedTags.length > 0) {
      listRef.current.scrollToIndex({index: 0});
    }
  }

  return (
    <RefreshableFlatList
      testID="tag-list"
      listRef={listRef}
      ListHeaderComponent={listHeader()}
      data={tags}
      onRefresh={refresh}
      showLoadingIndicator={isPerformingInitialLoad}
      contentContainerStyle={{paddingBottom: insets.bottom}}
      keyExtractor={item => item.id}
      renderItem={({item}) => (
        <Tag key={item.attributes.name} name={item.attributes.name} />
      )}
    />
  );
}
