import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
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
    <ScrollView contentContainerStyle={{paddingBottom: insets.bottom}}>
      {listHeader()}
      <View style={styles.tagContainer}>
        {tags?.map(tag => (
          <Tag
            key={tag.attributes.name}
            name={tag.attributes.name}
            style={styles.tag}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    marginRight: 8,
  },
});
