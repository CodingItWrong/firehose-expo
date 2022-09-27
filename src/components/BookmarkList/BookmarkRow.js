import * as Linking from 'expo-linking';
import {Platform, Pressable, Share, StyleSheet, View} from 'react-native';
import {Button, Card, Text, Title} from 'react-native-paper';
import domainForUrl from '../../utils/domainForUrl';
import Tag from '../Tag';

const isWeb = Platform.OS === 'web';

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

  function share() {
    Share.share({url: bookmark.attributes.url});
  }

  function renderTitle() {
    if (isWeb) {
      return (
        <Title href={bookmark.attributes.url} hrefAttrs={{target: '_blank'}}>
          {title}
        </Title>
      );
    } else {
      return (
        <Pressable
          onPress={() => openBookmark(bookmark.attributes.url)}
          onLongPress={share}
        >
          <Title>{title}</Title>
        </Pressable>
      );
    }
  }

  function renderUrl() {
    if (isWeb) {
      return (
        <Text href={bookmark.attributes.url} hrefAttrs={{target: '_blank'}}>
          {domainForUrl(url)}
        </Text>
      );
    } else {
      return (
        <Pressable
          onPress={() => openBookmark(bookmark.attributes.url)}
          onLongPress={share}
        >
          <Text>{domainForUrl(url)}</Text>
        </Pressable>
      );
    }
  }

  return (
    <Card style={style}>
      <Card.Content>
        {renderTitle()}
        {comment ? <Text style={styles.comment}>{comment}</Text> : null}
        <View style={styles.urlLine}>
          {renderUrl()}
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
          <ButtonWithSpacing onPress={onMarkUnread}>
            Mark Unread
          </ButtonWithSpacing>
        ) : (
          <ButtonWithSpacing onPress={onMarkRead} testID="mark-read-button">
            Mark Read
          </ButtonWithSpacing>
        )}
        <ButtonWithSpacing onPress={onEdit}>Edit</ButtonWithSpacing>
        <ButtonWithSpacing mode="contained" onPress={onDelete}>
          Delete
        </ButtonWithSpacing>
      </Card.Actions>
    </Card>
  );
}

function ButtonWithSpacing({children, ...props}) {
  const propsWithDefaults = {
    ...props,
    mode: props.mode || 'outlined', // dunno why it defaults to false
  };

  return (
    <View style={styles.button}>
      <Button {...propsWithDefaults}>{children}</Button>
    </View>
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
