import {useFocusEffect, useNavigation} from '@react-navigation/native';
import sortBy from 'lodash/sortBy';
import {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CenterColumn from '../../../components/CenterColumn';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import ScreenBackground from '../../../components/ScreenBackground';
import Tag from '../../../components/Tag';
import {useTags} from '../../../data/tags';
import sharedStyles from '../../../sharedStyles';

export default function TagListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tagClient = useTags();
  const [tags, setTags] = useState();
  const [errorMessage, setErrorMessage] = useState();

  const loadFromServer = useCallback(async () => {
    try {
      const response = await tagClient.all();
      const loadedTags = response.data;
      const sortedTags = sortBy(loadedTags, 'attributes.name');
      setTags(sortedTags);
      return sortedTags;
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

  function goToTag(tag) {
    navigation.navigate('TaggedLinksScreen', {tag: tag.attributes.name});
  }

  return (
    <ScreenBackground>
      <CenterColumn columnStyle={sharedStyles.bodyPadding}>
        <ScrollView contentContainerStyle={{paddingBottom: insets.bottom}}>
          {listHeader()}
          <View style={styles.tagContainer}>
            {tags?.map(tag => (
              <Tag
                key={tag.attributes.name}
                name={tag.attributes.name}
                style={styles.tag}
                onPress={() => goToTag(tag)}
              />
            ))}
          </View>
        </ScrollView>
      </CenterColumn>
    </ScreenBackground>
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
