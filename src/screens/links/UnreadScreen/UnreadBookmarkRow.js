import * as Linking from 'expo-linking';
import {Platform, Pressable, StyleSheet, View} from 'react-native';
import {Button, Card, Text, Title} from 'react-native-paper';
import domainForUrl from '../../../utils/domainForUrl';

export default function UnreadBookmarkRow({
  bookmark,
  onEdit,
  onMarkRead,
  onDelete,
}) {
  const {title, url, source} = bookmark.attributes;
  return (
    <Card
      style={styles.card}
      onPress={() => openBookmark(bookmark.attributes.url)}
    >
      <Card.Content>
        <Title>{title}</Title>
        <View style={styles.urlLine}>
          <Text>{domainForUrl(url)}</Text>
          <Source source={source} />
        </View>
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
  card: {
    margin: 15,
    marginBottom: 0,
  },
  button: {
    marginRight: 8,
  },
  urlLine: {
    flexDirection: 'row',
  },
});
