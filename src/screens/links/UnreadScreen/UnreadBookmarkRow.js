import * as Linking from 'expo-linking';
import {Platform, StyleSheet} from 'react-native';
import {Button, Card, Text, Title} from 'react-native-paper';

export default function UnreadBookmarkRow({
  bookmark,
  onEdit,
  onMarkRead,
  onDelete,
}) {
  return (
    <Card
      style={styles.card}
      onPress={() => openBookmark(bookmark.attributes.url)}
    >
      <Card.Content>
        <Title>{bookmark.attributes.title}</Title>
        <Text>{bookmark.attributes.url}</Text>
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

export function formatSource(source) {
  try {
    const domain = domainForUrl(source);
    console.log({source, domain});
    return domain;
  } catch (e) {
    console.log({source, e});
    return source;
  }
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
});
