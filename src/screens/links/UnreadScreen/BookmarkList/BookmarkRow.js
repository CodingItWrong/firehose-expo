import * as Linking from 'expo-linking';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Text, Title} from 'react-native-paper';
import domainForUrl from '../../../../utils/domainForUrl';

export default function BookmarkRow({
  bookmark,
  style,
  onEdit,
  onMarkRead,
  onDelete,
}) {
  const {title, url, source, comment} = bookmark.attributes;

  const tagList = bookmark.attributes['tag-list'];
  const tags = tagList ? tagList.split(' ') : [];

  return (
    <Card style={style}>
      <Card.Content>
        <Pressable onPress={() => openBookmark(bookmark.attributes.url)}>
          <Title>{title}</Title>
        </Pressable>
        {comment ? <Text style={styles.comment}>{comment}</Text> : null}
        <View style={styles.urlLine}>
          <Pressable onPress={() => openBookmark(bookmark.attributes.url)}>
            <Text>{domainForUrl(url)}</Text>
          </Pressable>
          <Source source={source} />
        </View>
        {tags.length > 0 && (
          <View style={styles.tagList}>
            {tags.map(tag => (
              <Chip key={tag} style={styles.tag}>
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button style={styles.button} mode="outlined" onPress={onMarkRead}>
          Mark Read
        </Button>
        <Button style={styles.button} mode="outlined" onPress={onEdit}>
          Edit
        </Button>
        <Button style={styles.button} mode="contained" onPress={onDelete}>
          Delete
        </Button>
      </Card.Actions>
    </Card>
  );
}

function Source({source}) {
  if (!source) {
    return null;
  }

  function renderSource() {
    const domain = domainForUrl(source);

    if (domain) {
      return (
        <Pressable onPress={() => openBookmark(source)}>
          <Text>From {domain}</Text>
        </Pressable>
      );
    } else {
      // not a URL
      return <Text>From {source}</Text>;
    }
  }

  return (
    <>
      <Text> | </Text>
      {renderSource()}
    </>
  );
}

function openBookmark(url) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
}

const styles = StyleSheet.create({
  button: {
    marginRight: 8,
  },
  comment: {
    marginBottom: 20,
  },
  urlLine: {
    flexDirection: 'row',
  },
  tagList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
  },
});
