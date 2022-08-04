import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import sortBy from 'lodash/sortBy';
import {useCallback} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import CenterColumn from '../../../components/CenterColumn';
import ErrorMessage from '../../../components/ErrorMessage';
import NoRecordsMessage from '../../../components/NoRecordsMessage';
import ScreenBackground from '../../../components/ScreenBackground';
import Tag from '../../../components/Tag';
import {useTags} from '../../../data/tags';
import sharedStyles from '../../../sharedStyles';

const TAGS_QUERY = 'tags';

export default function TagListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const tagClient = useTags();
  const tagResult = useQuery([TAGS_QUERY], () => tagClient.all());
  const queryClient = useQueryClient();

  const sortedTags = sortBy(tagResult?.data?.data, 'attributes.name');

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries(TAGS_QUERY);
    }, [queryClient]),
  );

  function listHeader() {
    if (tagResult.isError) {
      return <ErrorMessage>An error occurred while loading tags.</ErrorMessage>;
    } else if (sortedTags.length === 0) {
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
      <ScrollView contentContainerStyle={{paddingBottom: insets.bottom}}>
        <CenterColumn columnStyle={sharedStyles.bodyPadding}>
          {listHeader()}
          <View style={styles.tagContainer}>
            {sortedTags?.map(tag => (
              <Tag
                key={tag.attributes.name}
                name={tag.attributes.name}
                style={styles.tag}
                onPress={() => goToTag(tag)}
              />
            ))}
          </View>
        </CenterColumn>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
});
