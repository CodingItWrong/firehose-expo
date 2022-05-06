import * as Linking from 'expo-linking';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Chip, Text, Title} from 'react-native-paper';
import domainForUrl from '../../utils/domainForUrl';
import Tag from '../Tag';

export default function BookmarkRow({
  bookmark,
  style,
  onEdit,
  onPressTag,
  onMarkRead,
  onMarkUnread,
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
              <Tag
                key={tag}
                style={styles.tag}
                name={tag}
                onPress={() => onPressTag(tag)}
              />
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        {bookmark.attributes.read ? (
          <Button style={styles.button} mode="outlined" onPress={onMarkUnread}>
            Mark Unread
          </Button>
        ) : (
          <Button style={styles.button} mode="outlined" onPress={onMarkRead}>
            Mark Read
          </Button>
        )}
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
    const contents = (
      <Text numberOfLines={1} ellipsizeMode="tail">
        From {domain || source}
      </Text>
    );
    const wrapper = domain ? (
      <Pressable onPress={() => openBookmark(source)}>{contents}</Pressable>
    ) : (
      contents
    );

    return <View style={styles.source}>{wrapper}</View>;
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
  source: {
    flex: 1,
  },
  tagList: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
  },
});
